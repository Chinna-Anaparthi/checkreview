const express = require("express");
const Server_Logic = require("./server");
const app = express();
var parser = require("body-parser");
app.use(express.json({ limit: "10mb" }));
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());
const cors = require("cors");
app.use(cors());
const port = 3000;
// const ip = "172.17.15.150";

//Check_Review_Points_Admin_Data
app.post("/admin/emp_checkreviewpoint_insrt", (req, res, next) => {
  Server_Logic.AdminCheckReviewPoints(req, res, () => {});
});

app.get("/admin/emp_checkreviewpoint_data", (req, res, next) => {
  Server_Logic.AdminCheckReviewPointsGet(req, res, () => {});
});

app.delete(
  "/admin/emp_checkreviewpoint_del/:adminID/:category?/:question?",
  (req, res, next) => {
    Server_Logic.AdminCheckReviewPointsDelete(req, res, () => {});
  }
);

//Check_Review_Points_Employee_Data
app.post("/api/emp_checkreviewpoint_insrt", (req, res, next) => {
  Server_Logic.Employee_CheckReviewPoints_Post(req, res, () => {});
});

app.get("/api/emp_checkreviewpoint_data/:Empid?", (req, res, next) => {
  Server_Logic.Employee_CheckReviewPoints_Get(req, res, () => {});
});

app.put("/api/emp_checkreviewpoint_upd/:Empid", (req, res, next) => {
  Server_Logic.Employee_CheckReviewPoints_Update(req, res, () => {});
});

//Check_Review_Points_Employee_Manager_Data
app.post("/api/emp_manager_checkreviewpoint_insrt", (req, res, next) => {
  Server_Logic.Employee_Manager_CheckReviewPoints_Post(req, res, () => {});
});
app.get("/api/emp_manager_checkreviewpoint_data/:Empid?", (req, res, next) => {
  Server_Logic.Employee_manager_CheckReviewPoints_Get(req, res, () => {});
});

app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});
