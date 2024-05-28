const dayjs = require("dayjs");
const { StatusCodes } = require("http-status-codes");
const GetCurrentTime = async (req, res) => {
  const time = dayjs().add("8"  ,'h').format();
  // const time = dayjs().format();

  res.status(StatusCodes.OK).json({ currentTimeStamp: time });
};
module.exports = { GetCurrentTime };
