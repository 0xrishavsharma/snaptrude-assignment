import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className='p-6 bg-blue-500'>
            <ul className='flex justify-between'>
                <li>
                    <Link to='/' className='text-white'>
                        Home
                    </Link>
                </li>
                <li>
                    <Link to='/about' className='text-white'>
                        About
                    </Link>
                </li>
                <li>
                    <Link to='/contact' className='text-white'>
                        Contact
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
