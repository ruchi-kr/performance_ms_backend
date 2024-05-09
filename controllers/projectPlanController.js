const { StatusCodes } = require("http-status-codes");
const connection = require("../db");

const GetProjectPlan = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "get all PROjectplan" });
  const {project_id,stage}= req.body; 
};
const GetLatestProjectPlan = async (req, res) => {
  res
    .status(StatusCodes.OK)
    .json({ msg: "get latest PROjectplan ie last plan added" });
};
const AddProjectPlan = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "aDD PROjectplan" });
};
const EditProjectPlan = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "edit PROjectplan" });
};

module.exports = {
  GetProjectPlan,
  AddProjectPlan,
  GetLatestProjectPlan,
  EditProjectPlan,
};
