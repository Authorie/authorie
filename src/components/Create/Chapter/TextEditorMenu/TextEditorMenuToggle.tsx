import 'remixicon/fonts/remixicon.css'

type props = {
    icon: string,
    title: string,
    action?: (() => boolean),
    isActive?: (() => boolean)    
};

const TextEditorMenuToggle = ({ icon, title, action, isActive}:
    props) => {
    if (action) {
        return (
            <button
                onClick={action}
                title={title}
                className={`${isActive && isActive() ? 'bg-slate-300' : 'bg-transparent'} 
                rounded-md p-1 m-1 hover:bg-slate-200`}
            >
                <i className={`${icon}`}></i>
            </button>
        );
    } else {
        return (
            <div className="h-5 w-0.5 bg-slate-300 ml-2 mr-3 self-center">
            </div>
        )
    }
};

export default TextEditorMenuToggle;