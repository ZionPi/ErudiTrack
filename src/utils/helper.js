// src/utils/helper.js
export function showSuccessNotification(notify, message, title = '成功！', duration = 2000) {
  notify({
    title: title,
    message: message,
    type: 'success',
    duration: duration
  });
}

export function showErrorNotification(notify, message, title = '错误！', duration = 3000) {
  notify({
    title: title,
    message: message,
    type: 'error',
    duration: duration
  });
}