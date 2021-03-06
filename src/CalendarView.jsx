import React, { useEffect, useState } from "react";
import * as firebase from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import bootstrap from "bootstrap";
import {
  Alert,
  Modal,
  Button,
  Form,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import {
  collection,
  addDoc,
  query,
  where,
  setDoc,
  doc,
  getDocs,
} from "firebase/firestore";

export const CalendarView = (props) => {
  const { db } = props;
  const messageRef = collection(db, "memories");
  const [show, setShow] = useState(false);
  const [showMemModal, setShowMemModal] = useState(false);
  const [memories, setMemories] = useState(null);
  const [date, setDate] = useState(new Date());
  const [memory, setMemory] = useState({});
  const [newDate, setNewDate] = useState(new Date());
  const [funFact, setFunFact] = useState("");
  const [canPost, setCanPost] = useState(true);

  useEffect(() => {
    getDocs(
      query(messageRef, where("mem_time", "==", date.toDateString()))
    ).then((mems) => {
      var data = [];
      mems.forEach((m) => data.push({ ...m.data(), id: m.id }));
      setMemories(data);
    });
  }, [date, canPost]);

  let factAPI = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/${date.getMonth()}/${date.getDate()}`;
  useEffect(() => {
    setFunFact("");
    let thisDate = date;

    fetch(factAPI).then((resp) =>
      resp.json().then((data) => {
        if (thisDate != date) return;

        if (data.selected.length > 0) {
          var fact =
            data.selected[Math.floor(Math.random() * data.selected.length)];
          setFunFact(
            (date.getFullYear() - fact.year < 0
              ? "In " + Number(fact.year - date.getFullYear()) + " years, "
              : date.getFullYear() - fact.year + " years ago, ") +
              LowerCase(fact.text)
          );
        }
      })
    );
  }, [date]);

  const MemoryDisplay = ({ message, name, place }) => {
    return (
      <>
        <hr className="my-4"></hr>
        <p>
          <q>{message}</q>
        </p>

        {
          <i className="lead">
            {name && Capitalize(name) + " - "}
            {place}
          </i>
        }
        <hr className="my-4"></hr>
      </>
    );
  };

  return (
    <Container className="w-85">
      <Row className="my-4">
        <h1 className="display-2 m-6">The Calendar</h1>
      </Row>

      <Alert style={{ backgroundColor: "#212529", outline: false }}>
        <Alert.Heading style={{ color: "white" }}>
          <h1 className="display-4">Today is {date.toDateString()}</h1>
          <p className="lead">
            This is a place to share the special moments of life.
          </p>
        </Alert.Heading>

        <p className="row" style={{ color: "white" }}>
          <Button variant="outline-light btn-lg" onClick={() => setShow(true)}>
            Time Travel
          </Button>
        </p>
        <p className="row" style={{ color: "white" }}>
          <Col>
            <Button
              variant="outline-light btn-lg"
              onClick={() => setDate(new Date(Number(date) - 86400000))}
            >
              Yesterday
            </Button>
          </Col>
          <Col>
            <Button
              variant="outline-light btn-lg"
              disabled={date >= new Date() - 86400000}
              onClick={() => setDate(new Date(Number(date) + 86400000))}
            >
              Tomorrow
            </Button>
          </Col>
        </p>
      </Alert>
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={show}
        onHide={() => setShow(false)}
        placement={"bottom"}
      >
        <Modal.Header closeButton>
          <Modal.Title>When would you like to go?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col className="mb-4" />
              <Form.Group as={Col} className="mb-3" controlId="formDate">
                <Form.Control
                  required
                  type="date"
                  placeholder="Enter Destination"
                  defaultValue={date}
                  onChange={(e) => setNewDate(e.target.value)}
                  isInvalid={new Date(newDate) > new Date()}
                />
                <Form.Control.Feedback type="invalid">
                  Please choose a time in the past.
                </Form.Control.Feedback>
              </Form.Group>
              <Col className="mb-4" />
            </Row>
            <Row className="mb-3">
              <Button variant="outline-dark btn-lg" type="submit">
                I'm Ready
              </Button>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
      {memories &&
        memories.length > 0 &&
        memories.map((mem) => (
          <MemoryDisplay
            message={mem.message}
            name={mem.name}
            place={mem.place}
            key={mem.id}
          />
        ))}
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={showMemModal}
        onHide={() => setShowMemModal(false)}
        placement={"bottom"}
      >
        <Modal.Header closeButton>
          <Modal.Title>What made {date.toDateString()} special?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleMemSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} className="mb-4" controlId="formName">
                <Form.Control
                  type="text"
                  placeholder="Enter Name"
                  defaultValue={memory.name || ""}
                  onChange={(e) =>
                    setMemory({ ...memory, name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group as={Col} className="mb-4" controlId="formPlace">
                <Form.Control
                  type="text"
                  placeholder="Where Did it Happen?"
                  defaultValue={memory.place || ""}
                  onChange={(e) =>
                    setMemory({ ...memory, place: e.target.value })
                  }
                />
              </Form.Group>
            </Row>
            <Row>
              <Form.Group as={Col} className="mb-4" controlId="formMessage">
                <Form.Control
                  required
                  type="text"
                  as="textarea"
                  placeholder="What Happened?"
                  defaultValue={memory.message || ""}
                  onChange={(e) =>
                    setMemory({ ...memory, message: e.target.value })
                  }
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Button variant="outline-dark btn-lg" type="submit">
                Share
              </Button>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
      <Alert style={{ backgroundColor: "#212529", outline: false }}>
        <Alert.Heading style={{ color: "white" }}>
          <h1 className="display-4 my-4">
            What happened to you on {date.toDateString()}?
          </h1>
          <p className="lead">{funFact}</p>
        </Alert.Heading>

        <p className="row" style={{ color: "white" }}>
          <Button
            variant="outline-light btn-lg"
            onClick={() => setShowMemModal(true)}
          >
            Share Your Story
          </Button>
        </p>
      </Alert>
    </Container>
  );

  function Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  function LowerCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
  function handleSubmit(e) {
    e.preventDefault();

    let isInvalid = new Date(newDate) > new Date();
    if (!isInvalid) {
      setDate(
        new Date(
          Number(Number(new Date(newDate)) + date.getTimezoneOffset() * 60000)
        )
      );
      setShow(false);
    }
  }

  function handleMemSubmit(e) {
    e.preventDefault();
    //post the memory to the database
    memory.mem_time = date.toDateString();

    if (canPost) {
      setCanPost(false);
      addDoc(messageRef, memory).finally(() => {
        setShowMemModal(false);
        setMemory({ ...memory, place: null, message: null });
        setCanPost(true);
      });
    }
  }
};
