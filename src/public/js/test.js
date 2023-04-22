$(".sign-up").on("click", function () {
  $(".move-component").animate(
    {
      left: "40px",
    },
    500
  );
  $("#move-component-login").hide();
  $("#move-component-signup").show();
});

$(".log-in").on("click", function () {
  $(".move-component").animate(
    {
      left: "350px",
    },
    500
  );
  $("#move-component-signup").hide();
  $("#move-component-login").show();
});
