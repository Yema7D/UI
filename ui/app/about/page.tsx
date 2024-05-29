"use client";
import React, { useState } from "react";
import { Button, Divider, Textarea } from "@nextui-org/react";
import { CopyBlock, dracula } from "react-code-blocks";
import { Card, CardBody } from "@nextui-org/react";

export default function App() {
  const [inputQuery, setInputQuery] = useState("");
  const [outputQuery, setOutputQuery] = useState("");
    const [error, setError] = useState(false);
    
  const handleInputChange = (event: any) => {
    setInputQuery(event.target.value);
  };

  const handleExecuteQuery = () => {
    // Here you can execute the input query and get the output query
    // For demonstration purposes, let's just set the output query as the input query
    fetch("http://127.0.0.1:5000/submit-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: inputQuery
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data.optimized_query);
        setOutputQuery(data.optimized_query);
        setError(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(true);
      });
  };
  return (
    <div>
       
     
      <div
        className="flex justify-around p-8"
        style={{
          marginTop: "40px",
        }}
      >
        <div className="queryInput" >
          <Textarea
            isInvalid={error}
            style={{
              height: "350px",
              width: "900px",
            }}
            value={inputQuery}
            onChange={handleInputChange}
            variant={error ? "bordered" : "faded"}
            label="Query Input"
            placeholder="Enter your Query here"
            description="Enter your Query here Maximum 1000 characters"
            errorMessage={error ? "The Query that you entred seems to be invalide please check." : ""}
            className="max-w-xs"
          />
          <Button color="danger" onClick={handleExecuteQuery}>Execute Query</Button>
        </div>
        <div className="queryOutput">
          <Card
            style={{
              height: "400px",
              width: "500px",
            }}
          >
            <CardBody>
              <CopyBlock
                text={outputQuery}
                language="sql"
                showLineNumbers={true}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}