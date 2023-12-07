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
                const reviewPoints = categoryData[categoryName][0].ReviewPoints;
  
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
  
      const query = "SELECT * FROM admin_check_review_table"; // Update the table name
      Database_Kpi.query(query, (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "An error occurred" });
        }
  
        results.forEach((row) => {
          const {
            
            Value,
            ReviewPoints,
           
          } = row;
  
          if (!responseData[Value]) {
            responseData[Value] = {
              ReviewPoints: [],
             
            };
          }
  
          responseData[Value].ReviewPoints.push(ReviewPoints);
          
        });
  
        return res.status(200).json(responseData);
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "An error occurred" });
    }
  };
  
  //Check_Review_Points_Employee_Data
  const Employee_CheckReviewPoints_Post = (req, res) => {
    try {
        const data = req.body;
  
        if (data && Array.isArray(data.ratings)) {
            for (const rating of data.ratings) {
                const { Value, review_point, self_review,upload } = rating;
  
                const insertQuery = `INSERT INTO all_data_employee_check_review_table (Empid, Empname, Value, Review_Points, Self_Review,imageUrl) VALUES (?,?, ?, ?, ?, ?)`;
                const insertValues = [data.empid, data.empname, Value, review_point, self_review,upload];
  
                Database_Kpi.query(insertQuery, insertValues, (err, results) => { 
                    if (err) {
                        console.error(err);
                    }
                });
            }
  
            return res.status(201).json({ message: 'employee data added successfully' });
        } else {
            return res.status(400).json({ error: 'Invalid data format' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred' });
    }
  };
  const Employee_CheckReviewPoints_Get = (req, res) => {
    try {
        const { Empid } = req.params;
  
        let query = `
            SELECT Empid, Empname, Value, Review_Points, Self_Review,imageUrl
            FROM all_data_employee_check_review_table`;
  
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
                        imageUrl:row.imageUrl
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
                        imageUrl:row.imageUrl
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
  const Employee_CheckReviewPoints_Update = (req, res) => {
    try {
      const data = req.body;
  
      if (data && Array.isArray(data.ratings)) {
        const { Empid } = req.params;
  
        const updateQuery = `
          UPDATE all_data_employee_check_review_table
          SET Self_Review = ?,
          imageUrl = ?
          WHERE Empid = ? AND Value = ? AND Review_Points = ?`;
  
        const promises = [];
  
        data.ratings.forEach((rating) => {
          const { Self_Review, upload, Value, Review_Points } = rating;
          promises.push(
            new Promise((resolve, reject) => {
              Database_Kpi.query(
                updateQuery,
                [Self_Review, upload, Empid, Value, Review_Points],
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
        return res.status(400).json({ error: 'Invalid data format' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  //Check_Review_Points_Employee_Manager_Data
  const Employee_Manager_CheckReviewPoints_Post = (req, res) => {
    try {
        const data = req.body;
  
        if (data && Array.isArray(data.ratings)) {
            for (const rating of data.ratings) {
                const { Value, review_point, self_review,upload,m_rating,m_comments } = rating;
  
                const insertQuery = `INSERT INTO all_data_employee_manager_check_review_table (Empid, Empname, Value, Review_Points, Self_Review,imageUrl,Manager_Rating,Manager_Comments) VALUES (?,?,?,?, ?, ?, ?, ?)`;
                const insertValues = [data.empid, data.empname, Value, review_point, self_review,upload,m_rating,m_comments];
  
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
            SELECT Empid, Empname, Value, Review_Points, Self_Review,imageUrl,Manager_Rating,Manager_Comments
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
                        imageUrl:row.imageUrl,
                        Manager_Rating:row.Manager_Rating,
                        Manager_Comments:row.Manager_Comments
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
                        imageUrl:row.imageUrl,
                        Manager_Rating:row.Manager_Rating,
                        Manager_Comments:row.Manager_Comments
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
    Employee_manager_CheckReviewPoints_Get
  };
  