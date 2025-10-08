import Image from "next/image";
import ContactInfo from "../components/ContactInfo";
import { MdPhone, MdEmail, MdLocationOn } from "react-icons/md";

const Header = ({ resumeData, icons }) => {
  return (
    <div className="items-center mb-1 f-col">
      {resumeData.profilePicture.length > 0 && resumeData.showProfilePicture !== false && (
        <div className="overflow-hidden w-24 h-24 rounded-full border-2 border-fuchsia-700">
          <Image
            src={resumeData.profilePicture}
            alt="profile"
            width={100}
            height={100}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <h1 className="name">{resumeData.name}</h1>
      <p className="profession">{resumeData.position}</p>

      <div class="flex gap-4 items-center">

      <ContactInfo
        mainclass="flex flex-row gap-1 mb-1 contact"
        linkclass="inline-flex items-center gap-1"
        teldata={resumeData.contactInformation}
        emaildata={resumeData.email}
        addressdata={resumeData.address}
        telicon={<MdPhone />}
        emailicon={<MdEmail />}
        addressicon={<MdLocationOn />}
      />

        {resumeData.socialMedia.map((socialMedia, index) => {
          return (
            <a
              href={`https://${socialMedia.link}`}
              aria-label={socialMedia.socialMedia}
              key={index}
              title={socialMedia.socialMedia}
              target="_blank"
              rel="noreferrer"
              className="inline-flex gap-1 justify-center items-center social-media align-center"
            >
              {icons.map((icon, index) => {
                if (icon.name === socialMedia.socialMedia.toLowerCase()) {
                  return <span key={index}>{icon.icon}</span>;
                }
              })}
              {socialMedia.link}
            </a>
          );
        })}
      <div className="grid grid-cols-3 gap-1">
      </div>
      </div>
    </div>
  );
};

export default Header;
