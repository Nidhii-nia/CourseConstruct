"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuid4 } from "uuid"; 
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
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { startLoading, stopLoading } from "@/app/components/RouteLoader";

function AddNewCourseDialogue({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    includeVideo: false,
    noOfChapters: "",
    category: "",
    level: "",
  });

  const router = useRouter();

  // Set mounted state to prevent state updates after unmount
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    startLoading();

    try {
      const clientRequestId = uuid4();

      const result = await axios.post(
        "/api/generate-course-layout", // Use relative path
        {
          ...formData,
          clientRequestId,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 180000,
        }
      );

      if (result?.data?.success) {
        toast.success("🎉 Course Layout generated successfully!");
        
        if (mounted) {
          setIsOpen(false);
          resetForm();
        }

        router.push(`/workspace/edit-course/${result.data.cid}`);
      } else {
        toast.error(result?.data?.error || "⚠️ Failed to generate course.");
      }
    } catch (error) {
      console.error("❌ Error generating course:", error);
      
      // Don't update state if component is unmounted
      if (!mounted) return;
      
      toast.error(
        error.message ||
          "Failed to generate course. Please check your internet connection."
      );
    } finally {
      if (mounted) {
        setIsLoading(false);
      }
      stopLoading(); // No delay needed
    }
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open && !isLoading) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[550px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="w-5 h-5 text-primary" />
            Create New Course
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details below to generate a new course structure.
            AI will help create a comprehensive course layout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Course Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Course Name *
            </label>
            <Input
              id="name"
              placeholder="Enter course name (e.g., 'Advanced React Patterns')"
              value={formData.name}
              onChange={(e) => onHandleInputChange("name", e.target.value)}
              disabled={isLoading}
              maxLength={100}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              placeholder="Brief description of what this course covers..."
              value={formData.description}
              onChange={(e) => onHandleInputChange("description", e.target.value)}
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Include Videos */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">
                Include YouTube Videos
              </label>
              <p className="text-xs text-muted-foreground">
                AI will find relevant videos for each chapter
              </p>
            </div>
            <Switch
              checked={formData.includeVideo}
              onCheckedChange={(checked) => onHandleInputChange("includeVideo", checked)}
              disabled={isLoading}
            />
          </div>

          {/* Number of Chapters */}
          <div className="space-y-2">
            <label htmlFor="chapters" className="text-sm font-medium">
              Number of Chapters *
            </label>
            <Input
              id="chapters"
              type="number"
              min="1"
              max="20"
              placeholder="Enter number of chapters (1-20)"
              value={formData.noOfChapters}
              onChange={(e) => onHandleInputChange("noOfChapters", e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 5-10 chapters for optimal learning
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category (Optional)
            </label>
            <Input
              id="category"
              placeholder="e.g., Web Development, Data Science"
              value={formData.category}
              onChange={(e) => onHandleInputChange("category", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <label htmlFor="level" className="text-sm font-medium">
              Difficulty Level *
            </label>
            <Select
              value={formData.level}
              onValueChange={(value) => onHandleInputChange("level", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onGenerate}
            disabled={isLoading}
            className="w-full sm:w-auto ml-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Course
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewCourseDialogue;