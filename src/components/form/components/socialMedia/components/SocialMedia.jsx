import React from 'react';
import {handleSocialMedia} from "../units/handleSocialMedia";
import { useResumeContext } from "../../../../../context/ResumeContext";
import {removeLanguage} from "../../languages/utils/removeLanguage";
import {BsTrash3} from "react-icons/bs";
import {removeSocialMedia} from "../units/removeSocialMedia";

const SocialMedia = ({socialMedia, index}) => {
  const {resumeData, setResumeData} = useResumeContext();
  return (
    <div className="flex gap-5 w-fill items-top">
      <div
        className="flex-wrap-gap-2"
      >
        <input
          type="text"
          placeholder="Social Media"
          name="socialMedia"
          className="mb-0 w-full other-input"
          value={socialMedia.socialMedia}
          onChange={(e) => handleSocialMedia(resumeData, setResumeData, e, index)}
        />
        <input
          type="text"
          placeholder="Link"
          name="link"
          className="mb-0 w-full other-input"
          value={socialMedia.link}
          onChange={(e) => handleSocialMedia(resumeData, setResumeData, e, index)}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          removeSocialMedia(resumeData, setResumeData, index)
        }}
        aria-label="Remove"
        className="p-2 text-xl text-white bg-fuchsia-700 rounded h-fit"
      >
        <BsTrash3/>
      </button>
    </div>
  );
};

export default SocialMedia;
