"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

function AddNewCourseDialogue({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    includeVideo: false,
    noOfChapters: "",
    category: "",
    level: "",
  });

  const router = useRouter();

  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      includeVideo: false,
      noOfChapters: "",
      category: "",
      level: "",
    });
    setError(null);
    setRetryCount(0);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a course name.");
      return false;
    }
    if (formData.name.length > 100) {
      toast.error("Course name is too long (max 100 characters).");
      return false;
    }
    if (!formData.noOfChapters || formData.noOfChapters < 1) {
      toast.error("Please enter a valid number of chapters (minimum 1).");
      return false;
    }
    if (formData.noOfChapters > 20) {
      toast.error("Maximum 20 chapters allowed.");
      return false;
    }
    if (!formData.level) {
      toast.error("Please select a difficulty level.");
      return false;
    }
    return true;
  };

  const onGenerate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setRetryCount(0);

    try {
      const baseURL =
        typeof window !== "undefined" ? window.location.origin : "";

      let result;
      let attemptCount = 0;
      const maxAttempts = 3;

      while (attemptCount < maxAttempts) {
        try {
          attemptCount++;

          result = await axios.post(
            `${baseURL}/api/generate-course-layout`,
            {
              ...formData, // send only data (backend generates cid)
            },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 60000,
              validateStatus: (status) => status < 500,
            }
          );

          console.log("API Response:", result);

          if (result?.status === 200 && result.data?.success) {
            break;
          } else {
            throw new Error(result.data?.error || "Unknown API error");
          }
        } catch (err) {
          setRetryCount(attemptCount);
          if (attemptCount >= maxAttempts) throw err;

          const delay = 1000 * Math.pow(2, attemptCount - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      if (result?.data?.success) {
        toast.success("🎉 Course Layout generated successfully!");
        setIsOpen(false);
        resetForm();

        // ⬅ redirect using backend-generated cid
        router.push(`/workspace/edit-course/${result.data.cid}`);
      } else {
        toast.error("⚠️ Failed to generate course. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error generating course:", error);
      toast.error(
        error.message ||
          "Failed to generate course. Please check your internet connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[550px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            Create New Course Using AI
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Fill in the details below and let AI generate a structured course
            curriculum for you.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm text-red-600 font-medium">
              {error}
              {retryCount > 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Retry attempt: {retryCount}/3
                </p>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            <div className="flex-1 text-xs sm:text-sm text-blue-600">
              Generating your course... please wait 30–60 seconds.
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-4 py-3">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-gray-900">
              Course Name *
            </label>
            <Input
              placeholder="e.g., Introduction to React"
              value={formData.name}
              onChange={(e) => onHandleInputChange("name", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-gray-900">
              Description (Optional)
            </label>
            <Textarea
              placeholder="Describe what this course will cover..."
              rows={3}
              value={formData.description}
              onChange={(e) => onHandleInputChange("description", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-900">
                Number of Chapters *
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                placeholder="e.g., 5"
                value={formData.noOfChapters}
                onChange={(e) =>
                  onHandleInputChange("noOfChapters", e.target.value)
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-900">
                Difficulty Level *
              </label>
              <Select
                onValueChange={(value) => onHandleInputChange("level", value)}
                disabled={isLoading}
                value={formData.level}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">🌱 Beginner</SelectItem>
                  <SelectItem value="moderate">📚 Moderate</SelectItem>
                  <SelectItem value="advanced">🚀 Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-gray-900">
              Category (Optional)
            </label>
            <Input
              placeholder="e.g., Web Development"
              value={formData.category}
              onChange={(e) => onHandleInputChange("category", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="space-y-0.5">
              <label className="text-xs sm:text-sm font-medium text-gray-900">
                Include Video Content
              </label>
              <p className="text-[11px] text-gray-500">
                Generate video recommendations for each chapter
              </p>
            </div>

            <Switch
              checked={formData.includeVideo}
              onCheckedChange={(checked) =>
                onHandleInputChange("includeVideo", checked)
              }
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={isLoading}
          >
            Reset
          </Button>

          <Button
            onClick={onGenerate}
            disabled={isLoading}
            className="bg-linear-to-r from-blue-500 to-purple-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> Generate Course
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewCourseDialogue;
