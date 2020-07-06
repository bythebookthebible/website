import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";

export default function ProveOfMemReminder(props) {


    return (
        <Modal {...props}>
        <Modal.Header closeButton>
            <Modal.Title>Congrulations, seems like you have the verses in this module memorized!</Modal.Title>
        </Modal.Header>
        <Modal.Body>Schdule a zoom meeting with Rose and Catherine or send us a video of yourself reciting the bible verses in this module and get a MEMORY JEWEL!</Modal.Body>
        <Modal.Footer>
            <Button>Schedule ZOOM!</Button>
            <Button>Send us a VIDEO!</Button>
        </Modal.Footer>
        </Modal>
    )
    
}