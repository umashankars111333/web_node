function validateDummyToken(request, response, next) {
  const token = request.headers['x-auth-token'] || request.headers.authorization;

  if (!token) {
    return response.status(401).json({
      message: 'Unauthorized: token missing'
    });
  }

  request.user = { role: 'student' };
  next();
}

module.exports = { validateDummyToken };
