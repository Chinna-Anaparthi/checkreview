const Database_Kpi = require("./database");

//Check_Review_Points
const AdminCheckReviewPoints = (req, res) => {
  try {
    const data = req.body;

    if (Array.isArray(data) && data.length > 0) {
      for (const entry of data) {
        const adminId = entry.AdminId;
        const entryData = entry.data;

        if (Array.isArray(entryData) && entryData.length > 0) {
          for (const categoryData of entryData) {
            for (const categoryName in categoryData) {
              const category = categoryData[categoryName];

              // Check if 'category' and 'ReviewPoints' exist before accessing
              if (category && category.length > 0 && category[0].ReviewPoints) {
                const reviewPoints = category[0].ReviewPoints;

                if (Array.isArray(reviewPoints)) {
                  for (const question of reviewPoints) {
                    // Check if a similar entry already exists in the database
                    const checkQuery = `SELECT * FROM admin_check_review_table WHERE AdminId = ? AND Value = ? AND ReviewPoints = ?`;

                    Database_Kpi.query(
                      checkQuery,
                      [adminId, categoryName, question],
                      (err, results) => {
                        if (err) {
                          console.error(err);
                        } else {
                          if (results.length > 0) {
                            // Entry already exists, update it
                            const updateQuery = `UPDATE admin_check_review_table SET AdminId = ? WHERE AdminId = ? AND ReviewPoints = ?`;

                            Database_Kpi.query(
                              updateQuery,
                              [adminId, adminId, question],
                              (err, results) => {
                                if (err) {
                                  console.error(err);
                                }
                              }
                            );
                          } else {
                            // Entry doesn't exist, insert a new one
                            const insertQuery = `INSERT INTO admin_check_review_table (AdminId, Value, ReviewPoints) VALUES (?, ?, ?)`;

                            Database_Kpi.query(
                              insertQuery,
                              [adminId, categoryName, question],
                              (err, results) => {
                                if (err) {
                                  console.error(err);
                                }
                              }
                            );
                          }
                        }
                      }
                    );
                  }
                }
              }
            }
          }
        }
      }
    }

    return res
      .status(201)
      .json({ message: "admin checkreviewpoint metric added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};
const AdminCheckReviewPointsGet = (req, res) => {
  try {
    const responseData = {};

    const query = "SELECT * FROM admin_check_review_table";
    Database_Kpi.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "An error occurred" });
      }

      results.forEach((row) => {
        const { Value, ReviewPoints } = row;

        if (!responseData[Value]) {
          responseData[Value] = {
            "Review Points": [],
          };
        }

        responseData[Value]["Review Points"].push(ReviewPoints);
      });

      return res.status(200).json(responseData);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};
const AdminCheckReviewPointsDelete = (req, res) => {
  // Extract parameters from request
  const { adminID, category, question } = req.params;

  // Review Point: Input validation
  if (!adminID) {
    return res.status(400).json({ error: "Invalid adminID provided" });
  }

  // Constructing base SQL query
  let deleteQuery = `
    DELETE FROM admin_check_review_table 
    WHERE adminID = ?`;

  const queryParams = [adminID];

  // Adding conditions for category and question if provided
  if (category) {
    deleteQuery += " AND Value = ?";
    queryParams.push(category);
  }

  if (question) {
    deleteQuery += " AND ReviewPoints LIKE ?";
    queryParams.push(`%${question}%`);
  }

  // Database query execution
  Database_Kpi.query(deleteQuery, queryParams, (err, result) => {
    // Review Point: Error handling
    if (err) {
      console.error("Error deleting data:", err);
      return res.status(500).json({ error: "Failed to delete data" });
    }

    // Review Point: Check if data was deleted successfully
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "No matching data found for deletion" });
    }

    // Review Point: Successful response
    return res.json({
      success: true,
      message: "Admin employee metric deleted successfully",
    });
  });
};

//Check_Review_Points_Employee_Data
const Employee_CheckReviewPoints_Post = (req, res) => {
  try {
    const data = req.body;

    if (data && Array.isArray(data.ratings) && Array.isArray(data.projectInfo) && Array.isArray(data.projectInfo[0].techStack)) {
      const techStackValues = data.projectInfo[0].techStack.join(', '); 

      const insertQuery = `
        INSERT INTO all_data_employee_check_review (
          Empid, 
          Empname,
          projectName,
          projectType,
          projectScope,
          techStack,
          description,
          Value,
          Review_Points,
          Self_Review,
          imageUrl
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (const rating of data.ratings) {
        const { Value, ReviewPoint, Self_Review, imageUrl } = rating;

        const insertValues = [
          data.empid,
          data.empname,
          data.projectInfo[0].projectName,
          data.projectInfo[0].projectType,
          data.projectInfo[0].projectScope,
          techStackValues,
          data.projectInfo[0].description,
          Value,
          ReviewPoint,
          Self_Review,
          imageUrl,
        ];

        Database_Kpi.query(insertQuery, insertValues, (err, results) => {
          if (err) {
            console.error(err);
          }
        });
      }

      return res.status(201).json({ message: "Employee data added successfully" });
    } else {
      return res.status(400).json({ error: "Invalid data format" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};

const Employee_CheckReviewPoints_Get = (req, res) => {
  try {
    const { Empid } = req.params;

    let query = `
      SELECT * FROM all_data_employee_check_review`;

    const queryParams = [];

    // Check if Empid is provided in the URL
    if (Empid) {
      query += ` WHERE Empid = ?`;
      queryParams.push(Empid);
    }

    Database_Kpi.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Error fetching data:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }

      if (results.length === 0) {
        if (Empid) {
          return res
            .status(404)
            .json({ error: `Employee with Empid ${Empid} not found` });
        } else {
          return res.status(404).json({ error: "No employees found" });
        }
      }

      if (Empid) {
        const employeeData = {
          empid: results[0].Empid,
          empname: results[0].Empname,
          projectInfo: [
            {
              projectName: results[0].projectName,
              ProjectType: results[0].projectType,
              projectScope: results[0].projectScope,
              techStack: results[0].techStack ? results[0].techStack.split(',').map(stack => stack.trim()) : [],
              description: results[0].description,
            }
          ],
          ratings: results.map((row) => ({
            Value: row.Value,
            ReviewPoint: row.Review_Points,
            Self_Review: row.Self_Review === '1',
            imageUrl: row.imageUrl,
          })),
        };
        res.status(200).json(employeeData);
      } else {
        const employeesData = {};
        results.forEach((row) => {
          if (!employeesData[row.Empid]) {
            employeesData[row.Empid] = {
              empid: row.Empid,
              empname: row.Empname,
              projectInfo: [
                {
                  projectName: row.projectName,
                  ProjectType: row.projectType,
                  projectScope: row.projectScope,
                  techStack: row.techStack ? row.techStack.split(',').map(stack => stack.trim()) : [],
                  description: row.description,
                }
              ],
              ratings: [],
            };
          }
          employeesData[row.Empid].ratings.push({
            Value: row.Value,
            ReviewPoint: row.Review_Points,
            Self_Review: row.Self_Review === '1',
            imageUrl: row.imageUrl,
          });
        });

        const employees = Object.values(employeesData);
        res.status(200).json({ status: true, employees });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};

const Employee_CheckReviewPoints_Update = (req, res) => {
  try {
    const data = req.body;

    if (data && Array.isArray(data.ratings)) {
      const { Empid } = req.params;

      const updateQuery = `
        UPDATE all_data_employee_check_review
        SET projectName = ?, projectType = ?, projectScope = ?, techStack = ?, description = ?, Self_Review = ?, imageUrl = ?
        WHERE Empid = ? AND Value = ? AND Review_Points = ?`;

      const promises = [];

      data.ratings.forEach((rating) => {
        const { Value, ReviewPoint, Self_Review, imageUrl } = rating;
        promises.push(
          new Promise((resolve, reject) => {
            Database_Kpi.query(
              updateQuery,
              [data.projectInfo[0].projectName, data.projectInfo[0].ProjectType, data.projectInfo[0].projectState, JSON.stringify(data.projectInfo[0].techStack), data.projectInfo[0].description, Self_Review, imageUrl, Empid, Value, ReviewPoint],
              (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              }
            );
          })
        );
      });

      Promise.all(promises)
        .then(() => {
          return res.json({
            success: true,
            message: "Employee data updated successfully",
          });
        })
        .catch((err) => {
          console.error("Error updating data:", err);
          return res
            .status(500)
            .json({ error: "An error occurred while updating data." });
        });
    } else {
      return res.status(400).json({ error: "Invalid data format" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};

//Check_Review_Points_Employee_Manager_Data
const Employee_Manager_CheckReviewPoints_Post = (req, res) => {
  try {
    const data = req.body;

    if (data && Array.isArray(data.ratings)) {
        for (const rating of data.ratings) {
            const { Value, review_point, self_review, reviewver, Comments, Upload } = rating;

            const insertQuery = `INSERT INTO all_data_employee_manager_check_review_table(Empid, Empname, Value, Review_Points, Self_Review, Reviewver, Comments, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const insertValues = [data.empid, data.empname, Value, review_point, self_review, reviewver, Comments, Upload];

            Database_Kpi.query(insertQuery, insertValues, (err, results) => {
                if (err) {
                    console.error(err);
                }
            });
        }

        return res.status(201).json({ message: 'manager data added successfully' });
    } else {
        return res.status(400).json({ error: 'Invalid data format' });
    }
} catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
}
};

const Employee_manager_CheckReviewPoints_Get = (req, res) => {
  try {
    const { Empid } = req.params;

    let query = `
        SELECT Empid, Empname, Value, Review_Points, Self_Review ,Reviewver, Comments, imageUrl
        FROM all_data_employee_manager_check_review_table`;

    const queryParams = [];

    // Check if Empid is provided in the URL
    if (Empid) {
        query += ` WHERE Empid = ?`;
        queryParams.push(Empid);
    }

    Database_Kpi.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "An error occurred while fetching data" });
        }

        if (results.length === 0) {
            if (Empid) {
                return res.status(404).json({ error: `Employee with Empid ${Empid} not found` });
            } else {
                return res.status(404).json({ error: "No employees found" });
            }
        }

        if (Empid) {
            const employeeData = {
                Empid: results[0].Empid,
                Empname: results[0].Empname,
                ratings: results.map((row) => ({
                    Value:row.Value,
                    Review_Points: row.Review_Points,
                    Self_Review: row.Self_Review,
                    reviewver:row.Reviewver,
                    Manager_Comments:row.Comments,
                    Upload:row.imageUrl,
                })),
            };
            res.status(200).json({ employee: employeeData });
        } else {
            const employeesData = {};
            results.forEach((row) => {
                if (!employeesData[row.Empid]) {
                    employeesData[row.Empid] = {
                        Empid: row.Empid,
                        Empname: row.Empname,
                        ratings: [],
                    };
                }
                employeesData[row.Empid].ratings.push({
                  Value:row.Value,
                    Review_Points: row.Review_Points,
                    Self_Review: row.Self_Review,
                    reviewver:row.Reviewver,
                    Manager_Comments:row.Comments,
                    Upload:row.imageUrl,
                });
            });

            const data = Object.values(employeesData);
            res.status(200).json({ status: true, data });
        }
    });
} catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
}
};

module.exports = {
  AdminCheckReviewPoints,
  AdminCheckReviewPointsGet,
  Employee_CheckReviewPoints_Post,
  Employee_CheckReviewPoints_Get,
  Employee_CheckReviewPoints_Update,
  Employee_Manager_CheckReviewPoints_Post,
  Employee_manager_CheckReviewPoints_Get,
  AdminCheckReviewPointsDelete,
};
