const Review = require('../models/review');
const User = require('../models/user');

// Render admin dashboard
module.exports.adminDashboard = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      if (req.user.role === 'admin') {
        // populate all users
        let users = await User.find({}).populate('username');

        // get logged in user
        const filteredUsers = [];
        const loggedInUserEmail = req.user.email;

        for (let i = 0; i < users.length; i++) {
          const user = users[i];

          if (user.email !== loggedInUserEmail) {
            filteredUsers.push(user);
          }
        }
        return res.render('admin_dashboard', {
          title: 'Admin dashboard',
          users: filteredUsers,
        });
      } else {
        return res.redirect('back');
      }
    } else {
      return res.redirect('/');
    }
  } catch (err) {
    console.log(err);
    return res.redirect('/');
  }
};

// Render employee dashboard
module.exports.employeeDashboard = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      // populate the employee with reviews assigned to it and reviews from others
      const employee = await User.findById(req.params.id)
        .populate({
          path: 'reviewsRecievedFromOthers',
          populate: {
            path: 'reviewer',
            model: 'User',
          },
        })
        .populate('assignedUserReviews');

      // extract the reviews assigned to it
      const assignedUserReviews = employee.assignedUserReviews;

      // extract feedbacks from other employees
      const reviewsRecievedFromOthers = employee.reviewsRecievedFromOthers;

      // populate reviews given from others
      const populatedResult = await Review.find().populate({
        path: 'reviewer',
        model: 'User',
      });

      return res.render('employee_dashboard', {
        title: 'Employee dashboard',
        employee,
        assignedUserReviews,
        reviewsRecievedFromOthers,
      });
    } else {
      return res.redirect('/');
    }
  } catch (err) {
    console.log(err);
    return res.redirect('back');
  }
};
