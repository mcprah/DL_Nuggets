import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  MdArrowBack,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import axios from "axios";
import logo from "~/images/logo-removebg-preview.png";

export const meta: MetaFunction = () => {
  return [
    { title: "Create New Password | Lex Nuggets" },
    {
      name: "description",
      content: "Create a new password for your Lex Nuggets account.",
    },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { name: "robots", content: "noindex" }, // Prevent search engines from indexing this page
  ];
};
