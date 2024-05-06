const dayjs = require("dayjs");
const { StatusCodes } = require("http-status-codes");
const GetCurrentTime = async (req, res) => {
  const time = dayjs().add(0  ,'h').format();

  res.status(StatusCodes.OK).json({ currentTimeStamp: time });
};
module.exports = { GetCurrentTime };
