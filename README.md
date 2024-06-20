# Big Booster Learning App - Backend

## Overview

Big Booster Learning App is a backend application designed to support a learning platform for 12th class students. The backend provides APIs for managing PDF files, including uploading, downloading, and deleting files using AWS S3 Bucket. The project is built using Node.js, Express.js, and MongoDB.

## Features

- **AWS S3 Integration**: APIs for generating signed URLs to upload, download, and delete PDF files.
- **MongoDB**: Storing metadata of the PDF files.
- **RESTful APIs**: Endpoints for managing PDF files and retrieving metadata.

## Project Structure

The project is organized into the following structure:

```
big-booster-learning-app-backend/
│
│
├── .env
├── .gitignore
├── package.json
├── index.js
├── app.http
├── README.md
├── server.js
└── ...
```

## Getting Started

### Prerequisites

- Node.js (>= v20.13.1)
- npm (>= 10.5.2)
- MongoDB
- AWS S3 Bucket

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zishanverse/learning_material_backend
   cd learning_material_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following environment variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/priceComparison
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_S3_BUCKET_NAME=your_s3_bucket_name
   AWS_REGION=your_aws_region
   ```

### Running the App

To start the development server, run:
```bash
npm start
```

The server will start on [http://localhost:5000](http://localhost:4000).

## API Endpoints

### File Management

- **Get Signed URL for Uploading a PDF**
  - **Endpoint**: `POST /upload/pdf`
  - **Description**: Generates a signed URL for uploading a PDF to AWS S3.
  - **Request Body**: `{"filename": "string", "contentType": "string", "dateTime": "date", "tags": "array", "size": "number", "subject": "string", "marks": "number", "duration": "number", "description": "string"}`
  - **Response**: `{ "signedUrl": "string" }`

- **Get Signed URL for Downloading a PDF**
  - **Endpoint**: `PUT /getting/pdf/`
  - **Description**: Generates a signed URL for downloading a PDF from AWS S3.
  - **Request Body**: `{"name": "string"}`
  - **Response**: `{ "signedUrl": "string" }`

- **Get Signed URL for Deleting a PDF**
  - **Endpoint**: `DELETE /delete/?name`
  - **Description**: Generates a signed URL for deleting a PDF from AWS S3.
  - **Response**: `{ "string" }`

### PDF Metadata Management

- **Get All PDF Files Metadata**
  - **Endpoint**: `GET /all/pdf/`
  - **Description**: Retrieves metadata for all PDF files stored in MongoDB.
  - **Response**: `[ {"filename": "string", "contentType": "string", "dateTime": "date", "tags": "array", "size": "number", "subject": "string", "marks": "number", "duration": "number", "description": "string"} ]`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to reach out if you have any questions or need further assistance.

Happy learning!
