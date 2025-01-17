import { Link } from "react-router-dom";

// eslint-disable-next-line react/prop-types
export function BottomWarning({label, buttonText, to}) {
    return <div className=" text-sm flex justify-center">
      <div>
        {label}
      </div>
      <Link className="pointer underline pl-1 cursor-pointer" to={to}>
        {buttonText}
      </Link>
    </div>
}