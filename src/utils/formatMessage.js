const { format } = require("date-fns");

function formatMessage(username, text) {
  return {
    username,
    text,
    time: format(Date.now(), "h:mm a"),
  };
}

module.exports = formatMessage;
