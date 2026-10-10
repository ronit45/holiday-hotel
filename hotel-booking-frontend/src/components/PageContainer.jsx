const PageContainer = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default PageContainer;
