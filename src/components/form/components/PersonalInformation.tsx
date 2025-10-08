"use client";

import React from "react";
import { useResumeContext } from "@/context/ResumeContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const PersonalInformation: React.FC = () => {
  const { resumeData, handleProfilePicture, handleChange, setResumeData } = useResumeContext();

  const handleShowProfilePictureChange = (checked: boolean) => {
    setResumeData({
      ...resumeData,
      showProfilePicture: checked,
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Full Name"
              name="name"
              value={resumeData.name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Job Title</Label>
            <Input
              id="position"
              type="text"
              placeholder="Job Title"
              name="position"
              value={resumeData.position}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactInformation">Contact Information</Label>
            <Input
              id="contactInformation"
              type="text"
              placeholder="Contact Information"
              name="contactInformation"
              value={resumeData.contactInformation}
              onChange={handleChange}
              minLength={10}
              maxLength={15}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              name="email"
              value={resumeData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="Address"
              name="address"
              value={resumeData.address}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profileImage">Profile Picture</Label>
            <Input
              id="profileImage"
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleProfilePicture}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showProfilePicture"
              checked={resumeData.showProfilePicture !== false}
              onCheckedChange={handleShowProfilePictureChange}
            />
            <Label htmlFor="showProfilePicture" className="cursor-pointer">
              Show profile picture on resume
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInformation;

