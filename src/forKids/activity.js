import React from "react";
import { Button } from "react-bootstrap";
import { Row, Col } from "react-bootstrap";
import ActivityView from "./activityView";
import Testing from "./testing";

export default function Activity(props) {
  return (
    <div>
      <Row>
        <Col sm={9}>
          <ActivityView kind={props.kind} key={props.key} />
        </Col>
        <Col sm={3}>
          <Button
            className="btn-round"
            variant="primary"
            onClick={() => console.log("Clicked")}
          >
            Repeat
          </Button>
          <Button
            className="btn-round"
            variant="primary"
            onClick={() => Testing()}
          >
            Next Video
          </Button>
          <Button
            className="btn-round"
            variant="primary"
            onClick={() => console.log("clicked")}
          >
            Next Activity
          </Button>
          <Button
            className="btn-round"
            variant="primary"
            onClick={() => console.log("clicked")}
          >
            Back to Map
          </Button>
          <Button
            className="btn-round"
            variant="primary"
            onClick={() => console.log("clicked")}
          >
            Back to Home
          </Button>
        </Col>
      </Row>
    </div>
  );
}
