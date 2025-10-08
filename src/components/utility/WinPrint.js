import { MdPictureAsPdf } from "react-icons/md";

const WinPrint = () => {

const print = () => {
    window.print();
    };

return (
    <button
        aria-label="Download Resume"
        className="fixed right-5 bottom-5 p-1 font-bold rounded-full border-2 shadow-lg bg-primary-foreground border-secondary text-primary exclude-print"
        onClick={print}
      >
       <MdPictureAsPdf className="w-10 h-10" title="Download Resume"/>
      </button>
    );
};

export default WinPrint;