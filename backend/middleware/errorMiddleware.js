// Catch 404 and forward to error handler
const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // MySQL Duplicate entry error (ER_DUP_ENTRY)
  if (err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with this information already exists.';
  }

  // MySQL Foreign Key Constraint failure (ER_ROW_IS_REFERENCED_2)
  if (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 409;
    message = 'Cannot delete or update this record because it is referenced by other items.';
  }

  // MySQL Foreign Key Constraint parent not found (ER_NO_REFERENCED_ROW_2)
  if (err.errno === 1452 || err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced customer or plan does not exist.';
  }

  // MySQL Syntax / Check constraint
  if (err.errno === 3819 || err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    statusCode = 400;
    message = 'Record violates database constraints (e.g. negative price).';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};
