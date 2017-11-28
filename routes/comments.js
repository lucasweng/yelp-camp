const express    = require("express"),
      router     = express.Router({ mergeParams: true }),
      Campground = require("../models/campground"),
      Comment    = require("../models/comment"),
      middleware = require("../middleware");

// comments New
router.get("/new", middleware.isLoggedIn, (req, res) => {
  //find campground by id
  Campground.findById(req.params.id, (err, campground) => {
    if (err) { console.log(err); }
    else { res.render("comments/new", { campground }); }
  });
});

// comments Create
router.post("/", middleware.isLoggedIn, (req, res) => {
  //lookup campground using id
  Campground.findById(req.params.id, (err, campground) => {
    if (err) { 
      console.log(err);
      res.redirect("/campgrounds");
    }
    else {
      //create new comment
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          req.flash("error", "Something went wrong.");
          console.log(err);
        } else {
          //add username and id to comments
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //save comment
          comment.save();
          //connect new comment to campground
          campground.comments.push(comment);
          campground.save();
          //redirect to campground show page
          req.flash("success", "Successfully added comment");
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});


// comment Edit
router.get("/:comment_id/edit", middleware.checkCommentOwenership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      req.flash("error", "No campground found");
      return res.redirect("back");
    }
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) { res.redirect("back"); }
      else {
        res.render("comments/edit", { campground_id: req.params.id, comment: foundComment });
      }
    });
  });
});

// commnet Update
router.put("/:comment_id", middleware.checkCommentOwenership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
    if (err) { res.redirect("back"); }
    else { res.redirect("/campgrounds/" + req.params.id); }
  });
});

// comment Destroy
router.delete("/:comment_id", middleware.checkCommentOwenership, (req, res) => {
  //findByIdAndRemove
  Comment.findByIdAndRemove(req.params.comment_id, err => {
    if (err) { res.redirect("back"); }
    else {
      req.flash("success", "Comment deleted");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

module.exports = router;
