"use client";

import React, { useState } from "react";
import { useResumeContext } from "@/context/ResumeContext";
import { addSkill } from "../utlis/addSkill";
import { removeSkillGroup } from "../utlis/removeSkillGroup";
import { updateSkillGroupTitle } from "../utlis/updateSkillGroupTitle";
import SkillLine from "./SkillLine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface SkillsGroupProps {
  title: string;
}

const SkillsGroup: React.FC<SkillsGroupProps> = ({ title }) => {
  const { resumeData, setResumeData } = useResumeContext();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const skillType = resumeData.skills.find((s) => s.title === title);

  if (!skillType) return null;

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setEditTitle(title);
  };

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== title) {
      updateSkillGroupTitle(title, editTitle.trim(), setResumeData);
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  return (
    <div className="space-y-4 mb-6 p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              className="text-base font-semibold"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleTitleSave}
              aria-label="Save title"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleTitleCancel}
              aria-label="Cancel edit"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <Label className="text-base font-semibold">{title}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleTitleEdit}
              aria-label="Edit title"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => removeSkillGroup(title, setResumeData)}
          aria-label="Remove skill group"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {skillType.skills.map((skill, index) => (
          <SkillLine key={index} skill={skill} title={title} index={index} />
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addSkill(title, setResumeData)}
        aria-label="Add Skill"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add {title}
      </Button>
    </div>
  );
};

export default SkillsGroup;

