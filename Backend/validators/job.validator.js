exports.validateCreateJob = ({ title, company, applyLink, location }) => {
  const errors = [];
  
  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }
  
  if (!company || company.trim().length === 0) {
    errors.push("Company name is required");
  }
  
  if (!applyLink || applyLink.trim().length === 0) {
    errors.push("Apply link is required");
  }
  
  if (title && title.length > 200) {
    errors.push("Title cannot exceed 200 characters");
  }
  
  if (company && company.length > 100) {
    errors.push("Company name cannot exceed 100 characters");
  }
  
  if (location && location.length > 100) {
    errors.push("Location cannot exceed 100 characters");
  }
  
  if (applyLink && applyLink.length > 500) {
    errors.push("Apply link cannot exceed 500 characters");
  }
  
  if (applyLink && !/^https?:\/\/.+/.test(applyLink)) {
    errors.push("Apply link must be a valid URL");
  }
  
  if (errors.length > 0) {
    const error = new Error(errors.join(", "));
    error.statusCode = 400;
    throw error;
  }
};

exports.validateUpdateStatus = (status, allowedStatuses) => {
  if (!status) {
    const error = new Error("Status is required");
    error.statusCode = 400;
    throw error;
  }
  
  if (!allowedStatuses.includes(status)) {
    const error = new Error(`Invalid status. Must be: ${allowedStatuses.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
};
