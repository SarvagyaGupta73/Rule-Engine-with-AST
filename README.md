
# Overview

This application functions as a rule engine that assesses user eligibility based on various attributes, including age, department, salary, and experience. It employs an Abstract Syntax Tree (AST) for representing and managing conditional rules, facilitating the dynamic creation, combination, and evaluation of rules.

![Dashboard](https://github.com/SarvagyaGupta73/Rule-Engine-with-AST/blob/d87958e82d3b3ee31e1586f0a124ab6dcd7825dc/screenshots/dashboard.jpg)


## Features

- **Rule Creation**
  - Create rules with multiple conditions
  - Support for various comparison operators (`>`, `<`, `>=`, `<=`, `=`, `!=`)
  - String and numeric value handling
  - Automatic rule name validation
  - Visual rule tree representation

  ![Create_Rule](https://github.com/SarvagyaGupta73/Rule-Engine-with-AST/blob/d87958e82d3b3ee31e1586f0a124ab6dcd7825dc/screenshots/Create_Rule.jpg)

- **Rule Combination**
  - Combine multiple existing rules using AND/OR operators
  - Automatic generation of combined rule names
  - Prevention of rule name conflicts
  - Visual representation of combined rule structure

  ![Combine_Rule](https://github.com/SarvagyaGupta73/Rule-Engine-with-AST/blob/d87958e82d3b3ee31e1586f0a124ab6dcd7825dc/screenshots/Combine_Rule.jpg)

- **Rule Evaluation**
  - Evaluate rules against JSON data
  - Real-time evaluation results
  - Support for complex nested conditions
  - Detailed feedback on evaluation results

  ![Evalute_Rule](https://github.com/SarvagyaGupta73/Rule-Engine-with-AST/blob/d87958e82d3b3ee31e1586f0a124ab6dcd7825dc/screenshots/Evaluate_RUle.jpg)

- **User Interface**
  - Modern, responsive design
  - Real-time feedback and validation
  - Interactive rule visualization
  - Loading states and animations
  - Error handling and user feedback

## Design and Implementation

### Architecture

```
rule-engine/
├── server.js                 # Main server file
├── public/                   # Frontend assets
│   └── index.html           # Main frontend interface
├── package.json             # Project configuration
└── .env                     # Environment variables
```

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS for cross-origin requests
- dotenv for environment management

### Frontend
- HTML5
- CSS3 with modern features
- Vanilla JavaScript
- Fetch API for HTTP requests

### Database
- MongoDB Atlas

## Requirements

- Node.js (v14.0.0 or higher)
- MongoDB (v4.0.0 or higher)
- npm (v6.0.0 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Setup and Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/rule-engine.git
cd rule-engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
touch .env
```

4. **Configure environment variables**
Add the following to your .env file:
```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

5. **Start the server**
```bash
npm start
```

6. **Access the application**
Open your browser and navigate to:
```
http://localhost:3000
```

## Configuration

### Database Configuration

The application uses MongoDB Atlas. To configure your database:

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add the connection string to your .env file

### Server Configuration

You can configure the following server options in .env:

```env
PORT=3000                    # Server port
MONGO_URI=your_mongodb_url   # MongoDB connection string
```


