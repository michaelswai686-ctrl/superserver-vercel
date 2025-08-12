export default function handler(req, res) {
  const rawUri = process.env.MONGODB_URI || "";
  const uri = rawUri.trim();

  // Hide the password in the output
  const maskedUri = uri.replace(/:(.*)@/, ":***@");

  res.status(200).json({
    rawLength: rawUri.length,
    trimmedLength: uri.length,
    maskedUri,
    startsWith: uri.startsWith("mongodb+srv://"),
    endsWithSuperserver: uri.endsWith("/superserver?retryWrites=true&w=majority&appName=Cluster0"),
  });
}
