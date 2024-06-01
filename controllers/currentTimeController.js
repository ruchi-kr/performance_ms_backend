const dayjs = require("dayjs");
const { StatusCodes } = require("http-status-codes");
const GetCurrentTime = async (req, res) => {
  // const time = dayjs().add("-1"  ,'h').format();
  const time = dayjs().format();
  console.log("current time", time);
  res.status(StatusCodes.OK).json({ currentTimeStamp: time });
};
module.exports = { GetCurrentTime };
