exports.validateCreateNews = ({ title, summary, sourceLink }) => {
  const errors = [];
  
  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }
  
  if (!summary || summary.trim().length === 0) {
    errors.push("Summary is required");
  }
  
  if (title && title.length > 300) {
    errors.push("Title cannot exceed 300 characters");
  }
  
  if (summary && summary.length > 1000) {
    errors.push("Summary cannot exceed 1000 characters");
  }
  
  if (sourceLink && sourceLink.length > 500) {
    errors.push("Source link cannot exceed 500 characters");
  }
  
  if (sourceLink && !/^https?:\/\/.+/.test(sourceLink)) {
    errors.push("Source link must be a valid URL");
  }
  
  if (errors.length > 0) {
    const error = new Error(errors.join(", "));
    error.statusCode = 400;
    throw error;
  }
};
