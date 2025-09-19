import { ComputerDesktopIcon } from '@heroicons/react/24/outline';


export default function ChatLoading() {
  return (
    <div className={`chat chat-start mb-4 px-4 lg:px-8`}>
      <div className="chat-image avatar placeholder">
        <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center ring-1 ring-base-content/10">
          <div className="w-6 h-6 flex items-center justify-center">
            <ComputerDesktopIcon className="w-5 h-5 text-base-content/70" />
          </div>
        </div>
      </div>
      <div className={`chat-bubble chat-bubble-neutral max-w-[85%] lg:max-w-[75%]`}>
        <div style={{"height": "0px"}} className={`prose prose-headings:text-base-content prose-strong:text-base-content prose-p:text-base-content max-w-none`}>
          <span className="loading loading-dots loading-md"></span>
        </div>
      </div>
    </div>
  );
} 