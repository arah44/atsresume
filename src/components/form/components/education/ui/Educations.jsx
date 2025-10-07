import React from "react";
import { useResumeContext } from "../../../../../context/ResumeContext";
import {addEducation} from "../units/addEducation";
import Education from "../components/Education";
import {MdAddCircle} from "react-icons/md";

const Educations = () => {
  const {resumeData, setResumeData} = useResumeContext();

  return (
    <div className="flex-col-gap-2">
      <h2 className="input-title">Education</h2>
      {resumeData.education.map((education, index) => (
        <Education
          key={index}
          education={education}
          index={index}
        />
      ))}
      <button type="button"
              onClick={() => {
                addEducation(resumeData, setResumeData)
              }}
              aria-label="Add"
              className="p-2 w-[37px] text-white bg-fuchsia-700 rounded text-xl">
        <MdAddCircle/>
      </button>
    </div>
  )
}

export default Educations;
