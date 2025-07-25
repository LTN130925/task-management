const isValidPassword = (password: string) => {
  const hasLower = /[a-z]/.test(password); // Có ít nhất 1 ký tự thường
  const hasDigit = /\d/.test(password); // Có ít nhất 1 số
  const hasNoWhitespace = /^\S+$/.test(password); // Không có khoảng trắng
  const hasLength = password.length >= 8 && password.length <= 16; // Độ dài hợp lý

  return hasLower && hasDigit && hasNoWhitespace && hasLength;
}

export default isValidPassword