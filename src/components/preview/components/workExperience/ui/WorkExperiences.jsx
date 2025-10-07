import React from 'react';
import dynamic from "next/dynamic";
import { useResumeContext } from "../../../../../context/ResumeContext";
import WorkExperience from "../components/WorkExperience";

const Droppable = dynamic(
  () => import("react-beautiful-dnd").then((mod) => mod.Droppable),
  {ssr: false}
);

const WorkExperiences = () => {
  const {resumeData} = useResumeContext();

  return (
    <Droppable droppableId="work-experience" type="WORK_EXPERIENCE" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          <h2
            className="mb-1 border-b-2 border-gray-300 section-title editable"
            contentEditable
            suppressContentEditableWarning
          >
            Work Experience
          </h2>
          {resumeData.workExperience.map((item, index) => (
            <WorkExperience
              key={index}
              item={item}
              index={index}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default WorkExperiences;
