
import { Github, Code, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-6 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} AuraText Vault. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="#" 
              className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
            >
              <Github size={18} />
            </a>
            <a 
              href="#" 
              className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
            >
              <Code size={18} />
            </a>
            
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <Heart size={14} className="mx-1 text-red-500" />
              <span>in React</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
