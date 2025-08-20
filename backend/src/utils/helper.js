export const isAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "You are not authorized to access this route" });
  }
  next();
};

export const isStudent = (req, res, next) => {
  if (req.user.role !== "STUDENT") {
    return res
      .status(403)
      .json({ message: "You are not authorized to access this route" });
  }
  next();
};

export const formatDate = (dateString) => {
  // Handle both DD-MM-YYYY and D-M-YYYY formats
  const [day, month, year] = dateString.split("-");

  // Pad day and month with leading zeros if needed
  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");

  // Create date in YYYY-MM-DD format and convert to ISO string
  const isoDate = new Date(`${year}-${paddedMonth}-${paddedDay}`).toISOString();

  return isoDate;
};

export const isCounsellor = (req, res, next) => {
  if (req.user.role !== "COUNSELLOR") {
    return res.status(403).json({
      message: "You are not authorized to access this route",
    });
  }
  next();
};

export const isHead = (req, res, next) => {
  if(req.user.role !== "HEAD"){
    return res
    .status(403)
    .json({ message: "You are not authorized to access this route" });
  }
  next();
}