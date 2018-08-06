$(function(){
  let currentDate = new Date();

  // Turns date into "Month DD, YYYY" format.
  let formatDate = (date) => {
    let months = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];

    let day = date.getDate();
    let index = date.getMonth();
    let year = date.getFullYear();

    return `${months[index]} ${day}, ${year}`;
  };

  let formattedDate = formatDate(currentDate);
  $("#date").text(formattedDate);
});
