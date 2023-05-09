const date = new Date("2023-04-27T01:34:42.932Z");
const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000; // 获取当前时区偏移量并转换为以毫秒为单位的值
const targetTime = date.getTime() + timezoneOffset + 8 * 60 * 60 * 1000; // 添加时区偏移量和8小时的毫秒数
const targetDate = new Date(targetTime);
const year = targetDate.getFullYear();
const month = ("0" + (targetDate.getMonth() + 1)).slice(-2);
const day = ("0" + targetDate.getDate()).slice(-2);
const hour = ("0" + targetDate.getHours()).slice(-2);
const minute = ("0" + targetDate.getMinutes()).slice(-2);
const second = ("0" + targetDate.getSeconds()).slice(-2);
const ampm = hour >= 12 ? "pm" : "am";
const formattedDate = `${year}-${month}-${day} ${
  hour % 12
}:${minute}:${second}${ampm}`;

console.log(formattedDate);
