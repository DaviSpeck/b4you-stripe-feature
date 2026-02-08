export function sanitizeMailjetResponse(mailjetResponse) {
  if (!mailjetResponse) return null;

  return {
    body: mailjetResponse.body
      ? {
          Messages: mailjetResponse.body.Messages
            ? mailjetResponse.body.Messages.map((msg) => ({
                To: msg.To
                  ? msg.To.map((to) => ({
                      MessageID: to.MessageID,
                      MessageUUID: to.MessageUUID,
                      Email: to.Email,
                    }))
                  : null,
                Status: msg.Status,
              }))
            : null,
        }
      : null,
    statusCode: mailjetResponse.statusCode,
    headers: mailjetResponse.headers,
  };
}
