--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: api_clients_permissions_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.api_clients_permissions_enum AS ENUM (
    'canVerifyLicense',
    'canCreateLicense',
    'canModifyLicense',
    'canReadLicense'
);


ALTER TYPE public.api_clients_permissions_enum OWNER TO postgres;

--
-- Name: devices_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.devices_status_enum AS ENUM (
    'approved',
    'pending',
    'rejected',
    'deactivated'
);


ALTER TYPE public.devices_status_enum OWNER TO postgres;

--
-- Name: devices_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.devices_type_enum AS ENUM (
    'android',
    'ios'
);


ALTER TYPE public.devices_type_enum OWNER TO postgres;

--
-- Name: driving_school_applications_disability_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.driving_school_applications_disability_enum AS ENUM (
    'Yes',
    'No',
    'yes',
    'no'
);


ALTER TYPE public.driving_school_applications_disability_enum OWNER TO postgres;

--
-- Name: driving_school_applications_eyecolor_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.driving_school_applications_eyecolor_enum AS ENUM (
    'BLUE',
    'BLACK',
    'GREEN',
    'BROWN',
    'HAZEL',
    'GRAY'
);


ALTER TYPE public.driving_school_applications_eyecolor_enum OWNER TO postgres;

--
-- Name: driving_school_applications_facialmarks_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.driving_school_applications_facialmarks_enum AS ENUM (
    'Yes',
    'No',
    'yes',
    'no'
);


ALTER TYPE public.driving_school_applications_facialmarks_enum OWNER TO postgres;

--
-- Name: driving_school_applications_glasses_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.driving_school_applications_glasses_enum AS ENUM (
    'Yes',
    'No',
    'yes',
    'no'
);


ALTER TYPE public.driving_school_applications_glasses_enum OWNER TO postgres;

--
-- Name: email_notifications_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.email_notifications_status_enum AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);


ALTER TYPE public.email_notifications_status_enum OWNER TO postgres;

--
-- Name: licenses_disability_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.licenses_disability_enum AS ENUM (
    'Yes',
    'No',
    'yes',
    'no'
);


ALTER TYPE public.licenses_disability_enum OWNER TO postgres;

--
-- Name: licenses_eyecolor_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.licenses_eyecolor_enum AS ENUM (
    'BLUE',
    'BLACK',
    'GREEN',
    'BROWN',
    'HAZEL',
    'GRAY'
);


ALTER TYPE public.licenses_eyecolor_enum OWNER TO postgres;

--
-- Name: licenses_facialmarks_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.licenses_facialmarks_enum AS ENUM (
    'Yes',
    'No',
    'yes',
    'no'
);


ALTER TYPE public.licenses_facialmarks_enum OWNER TO postgres;

--
-- Name: licenses_glasses_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.licenses_glasses_enum AS ENUM (
    'Yes',
    'No',
    'yes',
    'no'
);


ALTER TYPE public.licenses_glasses_enum OWNER TO postgres;

--
-- Name: nodes_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nodes_status_enum AS ENUM (
    'approved',
    'pending',
    'rejected',
    'deactivated'
);


ALTER TYPE public.nodes_status_enum OWNER TO postgres;

--
-- Name: nodes_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nodes_type_enum AS ENUM (
    'android',
    'ios'
);


ALTER TYPE public.nodes_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: api_clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_clients (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    client_name character varying(150) NOT NULL,
    client_identity character varying(200) NOT NULL,
    client_email character varying(50) NOT NULL,
    client_phone character varying(20) NOT NULL,
    token text NOT NULL,
    is_active integer DEFAULT 0 NOT NULL,
    permissions public.api_clients_permissions_enum DEFAULT 'canReadLicense'::public.api_clients_permissions_enum NOT NULL,
    hash text NOT NULL,
    created_by integer
);


ALTER TABLE public.api_clients OWNER TO postgres;

--
-- Name: api_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.api_clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.api_clients_id_seq OWNER TO postgres;

--
-- Name: api_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.api_clients_id_seq OWNED BY public.api_clients.id;


--
-- Name: applicant_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applicant_files (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    document_type character varying(40),
    finger_type character varying(90),
    driving_school_id integer,
    file_id integer,
    driving_school_application_id integer
);


ALTER TABLE public.applicant_files OWNER TO postgres;

--
-- Name: applicant_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applicant_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.applicant_files_id_seq OWNER TO postgres;

--
-- Name: applicant_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applicant_files_id_seq OWNED BY public.applicant_files.id;


--
-- Name: audit_trails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_trails (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    user_id integer,
    db_action character varying(200) NOT NULL,
    table_name character varying(250) NOT NULL,
    resource_id integer NOT NULL,
    description text
);


ALTER TABLE public.audit_trails OWNER TO postgres;

--
-- Name: audit_trails_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_trails_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audit_trails_id_seq OWNER TO postgres;

--
-- Name: audit_trails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_trails_id_seq OWNED BY public.audit_trails.id;


--
-- Name: cbt_centers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cbt_centers (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying(80) NOT NULL,
    lga_id integer,
    state_id integer,
    is_active integer DEFAULT 0 NOT NULL,
    identifier character varying(50),
    phone character varying(20),
    email character varying(70),
    threshold integer DEFAULT 0 NOT NULL,
    devices integer DEFAULT 0 NOT NULL,
    address character varying
);


ALTER TABLE public.cbt_centers OWNER TO postgres;

--
-- Name: cbt_centers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cbt_centers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cbt_centers_id_seq OWNER TO postgres;

--
-- Name: cbt_centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cbt_centers_id_seq OWNED BY public.cbt_centers.id;


--
-- Name: cbt_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cbt_schedules (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    student_id integer,
    cbt_center_id integer,
    lga_id bigint,
    transaction_id integer,
    state_id integer,
    date character varying(40) NOT NULL,
    "time" character varying(20) NOT NULL,
    score double precision DEFAULT '0'::double precision NOT NULL,
    answers json,
    status integer DEFAULT 0 NOT NULL,
    cbt_status character varying(40) DEFAULT 'scheduled'::character varying NOT NULL,
    created_by integer,
    assessed_by integer,
    pre_registration_id integer,
    years integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.cbt_schedules OWNER TO postgres;

--
-- Name: cbt_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cbt_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cbt_schedules_id_seq OWNER TO postgres;

--
-- Name: cbt_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cbt_schedules_id_seq OWNED BY public.cbt_schedules.id;


--
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devices (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    organization_code character varying(80) NOT NULL,
    organization_name character varying(150) NOT NULL,
    license character varying(150) NOT NULL,
    device_id character varying,
    device_imei character varying(100) NOT NULL,
    type public.devices_type_enum DEFAULT 'android'::public.devices_type_enum NOT NULL,
    status public.devices_status_enum DEFAULT 'pending'::public.devices_status_enum NOT NULL
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.devices_id_seq OWNER TO postgres;

--
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.devices_id_seq OWNED BY public.devices.id;


--
-- Name: driving_school_application_queries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driving_school_application_queries (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    driving_school_id integer,
    reason text NOT NULL,
    queried_by_id integer NOT NULL
);


ALTER TABLE public.driving_school_application_queries OWNER TO postgres;

--
-- Name: driving_school_application_queries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driving_school_application_queries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.driving_school_application_queries_id_seq OWNER TO postgres;

--
-- Name: driving_school_application_queries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driving_school_application_queries_id_seq OWNED BY public.driving_school_application_queries.id;


--
-- Name: driving_school_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driving_school_applications (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    driving_school_id integer NOT NULL,
    training_duration_id integer NOT NULL,
    reference character varying(80) NOT NULL,
    nin character varying(20) NOT NULL,
    application_no character varying(40) NOT NULL,
    title_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    middle_name character varying(50),
    last_name character varying(50) NOT NULL,
    maiden_name character varying(50) NOT NULL,
    email character varying(60) NOT NULL,
    phone character varying(20),
    gender_id integer NOT NULL,
    date_of_birth character varying(20) NOT NULL,
    place_of_birth character varying(80) NOT NULL,
    nationality_id integer NOT NULL,
    state_of_origin_id integer NOT NULL,
    lga_of_origin_id integer NOT NULL,
    address character varying(255),
    occupation_id integer NOT NULL,
    marital_status_id integer NOT NULL,
    blood_group_id integer NOT NULL,
    next_of_kin_name character varying(100) NOT NULL,
    next_of_kin_phone character varying(20) NOT NULL,
    next_of_kin_relationship_id integer NOT NULL,
    next_of_kin_nationality_id integer NOT NULL,
    status integer DEFAULT 0 NOT NULL,
    course_level character varying(50) DEFAULT 'beginner'::character varying NOT NULL,
    approved_by_id bigint,
    approved_at timestamp without time zone,
    created_by integer,
    height real DEFAULT '78'::real NOT NULL,
    weight real DEFAULT '175'::real NOT NULL,
    "eyeColor" public.driving_school_applications_eyecolor_enum DEFAULT 'BLACK'::public.driving_school_applications_eyecolor_enum,
    "facialMarks" public.driving_school_applications_facialmarks_enum DEFAULT 'no'::public.driving_school_applications_facialmarks_enum,
    glasses public.driving_school_applications_glasses_enum DEFAULT 'no'::public.driving_school_applications_glasses_enum,
    disability public.driving_school_applications_disability_enum DEFAULT 'no'::public.driving_school_applications_disability_enum
);


ALTER TABLE public.driving_school_applications OWNER TO postgres;

--
-- Name: driving_school_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driving_school_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.driving_school_applications_id_seq OWNER TO postgres;

--
-- Name: driving_school_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driving_school_applications_id_seq OWNED BY public.driving_school_applications.id;


--
-- Name: driving_school_instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driving_school_instructors (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    driving_school_id integer NOT NULL,
    name character varying(150) NOT NULL,
    avatar character varying(150),
    phone character varying(20) NOT NULL,
    email character varying(100) NOT NULL,
    date_of_birth character varying(20) NOT NULL,
    gender_id integer NOT NULL,
    lga_id integer NOT NULL,
    state_id integer NOT NULL,
    address text,
    is_active integer DEFAULT 0 NOT NULL,
    instructor_id character varying,
    created_by integer
);


ALTER TABLE public.driving_school_instructors OWNER TO postgres;

--
-- Name: driving_school_instructors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driving_school_instructors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.driving_school_instructors_id_seq OWNER TO postgres;

--
-- Name: driving_school_instructors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driving_school_instructors_id_seq OWNED BY public.driving_school_instructors.id;


--
-- Name: driving_schools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driving_schools (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    identifier character varying(50) NOT NULL,
    name character varying(80) NOT NULL,
    logo character varying(255),
    phone character varying(20) NOT NULL,
    email character varying(100),
    address text,
    lga_id integer,
    state_id integer,
    rc_number character varying(30),
    total_vehicles integer DEFAULT 0 NOT NULL,
    special_gadgets text,
    total_simulators integer DEFAULT 0 NOT NULL,
    teaching_aids character varying(200),
    training_range character varying(100),
    total_classrooms integer DEFAULT 0 NOT NULL,
    classroom_capacity character varying(100),
    total_instructors integer DEFAULT 0 NOT NULL,
    doc_type character varying(90),
    doc_file character varying(150),
    is_active integer DEFAULT 0 NOT NULL,
    "reasonForSuspension" text,
    created_by integer,
    reference character varying(80),
    status integer DEFAULT 0 NOT NULL,
    officer_id integer,
    inspection_date timestamp without time zone,
    inspection_end_date timestamp without time zone,
    vehicle_types jsonb
);


ALTER TABLE public.driving_schools OWNER TO postgres;

--
-- Name: driving_schools_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driving_schools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.driving_schools_id_seq OWNER TO postgres;

--
-- Name: driving_schools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driving_schools_id_seq OWNED BY public.driving_schools.id;


--
-- Name: driving_test_centers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driving_test_centers (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    identifier character varying(50) NOT NULL,
    name character varying(80) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(70),
    lga_id integer,
    state_id integer,
    threshold integer NOT NULL,
    devices integer NOT NULL,
    address character varying,
    is_active integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.driving_test_centers OWNER TO postgres;

--
-- Name: driving_test_centers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driving_test_centers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.driving_test_centers_id_seq OWNER TO postgres;

--
-- Name: driving_test_centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driving_test_centers_id_seq OWNED BY public.driving_test_centers.id;


--
-- Name: driving_test_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driving_test_schedules (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    pre_registration_id integer,
    driving_test_center_id integer,
    license_class_id integer,
    lga_id integer,
    transaction_id integer,
    state_id integer,
    date character varying(40) NOT NULL,
    "time" character varying(20) NOT NULL,
    score double precision DEFAULT '0'::double precision NOT NULL,
    answers jsonb DEFAULT '[]'::jsonb,
    files json,
    vehicle_type character varying(90),
    location character varying(100),
    booking_status integer DEFAULT 0 NOT NULL,
    status character varying(40) DEFAULT 'scheduled'::character varying NOT NULL,
    assessed_by integer,
    years integer DEFAULT 1 NOT NULL,
    student_id integer
);


ALTER TABLE public.driving_test_schedules OWNER TO postgres;

--
-- Name: driving_test_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driving_test_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.driving_test_schedules_id_seq OWNER TO postgres;

--
-- Name: driving_test_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driving_test_schedules_id_seq OWNED BY public.driving_test_schedules.id;


--
-- Name: email_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_notifications (
    id integer NOT NULL,
    status public.email_notifications_status_enum NOT NULL,
    "to" character varying(50) NOT NULL,
    "from" character varying(100) NOT NULL,
    subject character varying(100) NOT NULL,
    text text NOT NULL,
    html text NOT NULL,
    attachments json,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_notifications OWNER TO postgres;

--
-- Name: email_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.email_notifications_id_seq OWNER TO postgres;

--
-- Name: email_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_notifications_id_seq OWNED BY public.email_notifications.id;


--
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files (
    id integer NOT NULL,
    file_name character varying NOT NULL,
    bucket_key character varying NOT NULL,
    bucket_name character varying NOT NULL,
    mime_type character varying(50) NOT NULL,
    checksum character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.files OWNER TO postgres;

--
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.files_id_seq OWNER TO postgres;

--
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- Name: inspection_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspection_questions (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    response jsonb NOT NULL,
    state_id bigint NOT NULL,
    created_by integer NOT NULL
);


ALTER TABLE public.inspection_questions OWNER TO postgres;

--
-- Name: inspection_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inspection_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inspection_questions_id_seq OWNER TO postgres;

--
-- Name: inspection_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inspection_questions_id_seq OWNED BY public.inspection_questions.id;


--
-- Name: inspections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspections (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    driving_school_id integer NOT NULL,
    name character varying(200),
    comment text,
    status character varying,
    month integer,
    year integer,
    created_by integer,
    "totalScore" double precision DEFAULT '0'::double precision NOT NULL,
    inspection_result jsonb,
    state_id bigint,
    query_reasons jsonb,
    acknowledged_inspection boolean DEFAULT false NOT NULL
);


ALTER TABLE public.inspections OWNER TO postgres;

--
-- Name: inspections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inspections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.inspections_id_seq OWNER TO postgres;

--
-- Name: inspections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inspections_id_seq OWNED BY public.inspections.id;


--
-- Name: license_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.license_files (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    document_type character varying(40),
    finger_type character varying(90),
    pre_registration_id integer,
    license_id integer,
    file_id integer
);


ALTER TABLE public.license_files OWNER TO postgres;

--
-- Name: license_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.license_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.license_files_id_seq OWNER TO postgres;

--
-- Name: license_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.license_files_id_seq OWNED BY public.license_files.id;


--
-- Name: licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.licenses (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    pre_registration_id integer,
    transaction_id integer,
    reference character varying(80) NOT NULL,
    title_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    middle_name character varying(50),
    last_name character varying(50) NOT NULL,
    maiden_name character varying(50) NOT NULL,
    email character varying(60) NOT NULL,
    phone character varying(20),
    license_no character varying(100),
    old_license_no character varying(100),
    request_type character varying(80) NOT NULL,
    license_class_id integer,
    years integer,
    date_of_birth character varying(20) NOT NULL,
    gender_id integer NOT NULL,
    nationality_id integer NOT NULL,
    state_id integer NOT NULL,
    lga_id integer NOT NULL,
    address character varying(255) NOT NULL,
    station_id integer,
    height real DEFAULT '78'::real NOT NULL,
    weight real DEFAULT '175'::real NOT NULL,
    serial_number character varying(200),
    affidavit_no character varying(100),
    status character varying(40) DEFAULT 'pending'::character varying NOT NULL,
    print_status integer DEFAULT 0 NOT NULL,
    issued_by_id bigint,
    approval_level integer DEFAULT 1 NOT NULL,
    issued_at timestamp without time zone,
    expiry_at timestamp without time zone,
    source character varying(100) NOT NULL,
    replacement_reason character varying(60),
    is_active integer DEFAULT 0 NOT NULL,
    created_by integer,
    "eyeColor" public.licenses_eyecolor_enum DEFAULT 'BLACK'::public.licenses_eyecolor_enum,
    "facialMarks" public.licenses_facialmarks_enum DEFAULT 'no'::public.licenses_facialmarks_enum,
    glasses public.licenses_glasses_enum DEFAULT 'no'::public.licenses_glasses_enum,
    disability public.licenses_disability_enum DEFAULT 'no'::public.licenses_disability_enum
);


ALTER TABLE public.licenses OWNER TO postgres;

--
-- Name: licenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.licenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.licenses_id_seq OWNER TO postgres;

--
-- Name: licenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.licenses_id_seq OWNED BY public.licenses.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: mvaa_offices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mvaa_offices (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying(80) NOT NULL,
    lga_id integer,
    state_id integer,
    is_active integer DEFAULT 0 NOT NULL,
    identifier character varying(50),
    phone character varying(20),
    email character varying(70),
    threshold integer DEFAULT 0 NOT NULL,
    devices integer DEFAULT 0 NOT NULL,
    address character varying
);


ALTER TABLE public.mvaa_offices OWNER TO postgres;

--
-- Name: mvaa_offices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mvaa_offices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mvaa_offices_id_seq OWNER TO postgres;

--
-- Name: mvaa_offices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mvaa_offices_id_seq OWNED BY public.mvaa_offices.id;


--
-- Name: nodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nodes (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    device_imei character varying NOT NULL,
    license character varying,
    device_id character varying,
    organization_code character varying(80) NOT NULL,
    organization_name character varying(150) NOT NULL,
    status public.nodes_status_enum DEFAULT 'pending'::public.nodes_status_enum NOT NULL,
    rejection_reason character varying,
    requester_email character varying NOT NULL,
    requester_first_name character varying NOT NULL,
    requester_last_name character varying NOT NULL,
    requester_phone character varying NOT NULL,
    type public.nodes_type_enum DEFAULT 'android'::public.nodes_type_enum NOT NULL,
    activated_by integer
);


ALTER TABLE public.nodes OWNER TO postgres;

--
-- Name: nodes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nodes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.nodes_id_seq OWNER TO postgres;

--
-- Name: nodes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nodes_id_seq OWNED BY public.nodes.id;


--
-- Name: otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otps (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    email character varying(50),
    phone character varying(20),
    otp character varying(10) NOT NULL,
    issued_at timestamp without time zone DEFAULT now() NOT NULL,
    is_used boolean DEFAULT false NOT NULL
);


ALTER TABLE public.otps OWNER TO postgres;

--
-- Name: otps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.otps_id_seq OWNER TO postgres;

--
-- Name: otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.otps_id_seq OWNED BY public.otps.id;


--
-- Name: payment_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_settings (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    state_id bigint NOT NULL,
    lga_id bigint NOT NULL,
    driving_school_id bigint,
    name character varying(100) NOT NULL,
    amount numeric DEFAULT '0'::numeric NOT NULL,
    charges numeric DEFAULT '0'::numeric NOT NULL,
    type character varying(150) NOT NULL,
    prefix character varying(10) NOT NULL,
    status integer DEFAULT 1 NOT NULL,
    currency character varying(3) NOT NULL
);


ALTER TABLE public.payment_settings OWNER TO postgres;

--
-- Name: payment_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_settings_id_seq OWNER TO postgres;

--
-- Name: payment_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_settings_id_seq OWNED BY public.payment_settings.id;


--
-- Name: permits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permits (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    student_id integer NOT NULL,
    transaction_id integer,
    reference character varying(80) NOT NULL,
    title_id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    middle_name character varying(50),
    last_name character varying(50) NOT NULL,
    maiden_name character varying(50) NOT NULL,
    email character varying(60) NOT NULL,
    phone character varying(20),
    permit_no character varying(100),
    old_permit_no character varying(100),
    request_type character varying(80),
    permit_class_id integer,
    years integer,
    date_of_birth character varying(20) NOT NULL,
    gender_id integer NOT NULL,
    nationality_id integer NOT NULL,
    state_id integer NOT NULL,
    lga_id integer NOT NULL,
    address character varying(255) NOT NULL,
    station_id integer,
    serial_number character varying(200),
    print_status integer DEFAULT 0 NOT NULL,
    issued_by_id bigint,
    issued_at timestamp without time zone,
    expiry_at timestamp without time zone,
    replacement_reason character varying(60),
    is_active integer DEFAULT 0 NOT NULL,
    created_by integer,
    source character varying(100) DEFAULT 'public_portal'::character varying NOT NULL
);


ALTER TABLE public.permits OWNER TO postgres;

--
-- Name: permits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permits_id_seq OWNER TO postgres;

--
-- Name: permits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permits_id_seq OWNED BY public.permits.id;


--
-- Name: pre_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pre_registrations (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    application_no character varying(80),
    student_id integer NOT NULL,
    cbt_center_id integer,
    cbt_schedule_id integer,
    driving_school_id integer,
    driving_test_center_id integer,
    driving_test_schedule_id integer,
    reference character varying(80),
    license_class_id integer,
    years integer,
    rrr character varying(80),
    status integer DEFAULT 0 NOT NULL,
    created_by integer
);


ALTER TABLE public.pre_registrations OWNER TO postgres;

--
-- Name: pre_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pre_registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pre_registrations_id_seq OWNER TO postgres;

--
-- Name: pre_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pre_registrations_id_seq OWNED BY public.pre_registrations.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    question_text character varying NOT NULL,
    question_image character varying(100),
    options json NOT NULL,
    correct_answer character varying NOT NULL,
    explanation character varying,
    difficulty_level integer DEFAULT 1 NOT NULL,
    category integer DEFAULT 1,
    time_limit integer DEFAULT 10 NOT NULL,
    question_type character varying,
    created_by integer
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.questions_id_seq OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    driving_school_id integer NOT NULL,
    application_id integer NOT NULL,
    student_no character varying(40) NOT NULL,
    certificate_no character varying(60),
    is_active integer DEFAULT 0 NOT NULL,
    graduated boolean DEFAULT false NOT NULL,
    created_by integer,
    modules json
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.students_id_seq OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: test_nins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_nins (
    id integer NOT NULL,
    nin character varying NOT NULL,
    data jsonb NOT NULL
);


ALTER TABLE public.test_nins OWNER TO postgres;

--
-- Name: test_nins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_nins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.test_nins_id_seq OWNER TO postgres;

--
-- Name: test_nins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_nins_id_seq OWNED BY public.test_nins.id;


--
-- Name: training_durations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.training_durations (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    driving_school_id integer NOT NULL,
    duration integer NOT NULL,
    duration_text character varying(20) NOT NULL,
    is_active integer DEFAULT 0 NOT NULL,
    created_by integer
);


ALTER TABLE public.training_durations OWNER TO postgres;

--
-- Name: training_durations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.training_durations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.training_durations_id_seq OWNER TO postgres;

--
-- Name: training_durations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.training_durations_id_seq OWNED BY public.training_durations.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    user_id bigint,
    email character varying(100) NOT NULL,
    amount numeric DEFAULT '0'::numeric NOT NULL,
    status character varying(10) NOT NULL,
    reference character varying(40) NOT NULL,
    channel character varying(20),
    type character varying(40) NOT NULL,
    currency character varying(3) NOT NULL,
    log text NOT NULL,
    item_type character varying(40) NOT NULL,
    item_id bigint,
    provider character varying(30) NOT NULL,
    used smallint DEFAULT '0'::smallint NOT NULL,
    charges numeric DEFAULT '0'::numeric NOT NULL,
    refunded boolean DEFAULT false NOT NULL,
    success_redirect_url character varying(250),
    failure_redirect_url character varying(250)
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(80) NOT NULL,
    middle_name character varying(80),
    last_name character varying(80) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(100),
    avatar text,
    address text,
    state_id bigint,
    lga_id bigint,
    driving_school_id integer,
    role_id integer,
    role_name character varying(60),
    change_password_next_login integer DEFAULT 0 NOT NULL,
    password text NOT NULL,
    device character varying(500),
    last_password_change timestamp without time zone DEFAULT now() NOT NULL,
    is_active integer DEFAULT 0 NOT NULL,
    files json,
    access_token text,
    permissions text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    node_id integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: api_clients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_clients ALTER COLUMN id SET DEFAULT nextval('public.api_clients_id_seq'::regclass);


--
-- Name: applicant_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicant_files ALTER COLUMN id SET DEFAULT nextval('public.applicant_files_id_seq'::regclass);


--
-- Name: audit_trails id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_trails ALTER COLUMN id SET DEFAULT nextval('public.audit_trails_id_seq'::regclass);


--
-- Name: cbt_centers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cbt_centers ALTER COLUMN id SET DEFAULT nextval('public.cbt_centers_id_seq'::regclass);


--
-- Name: cbt_schedules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cbt_schedules ALTER COLUMN id SET DEFAULT nextval('public.cbt_schedules_id_seq'::regclass);


--
-- Name: devices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices ALTER COLUMN id SET DEFAULT nextval('public.devices_id_seq'::regclass);


--
-- Name: driving_school_application_queries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_application_queries ALTER COLUMN id SET DEFAULT nextval('public.driving_school_application_queries_id_seq'::regclass);


--
-- Name: driving_school_applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_applications ALTER COLUMN id SET DEFAULT nextval('public.driving_school_applications_id_seq'::regclass);


--
-- Name: driving_school_instructors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_instructors ALTER COLUMN id SET DEFAULT nextval('public.driving_school_instructors_id_seq'::regclass);


--
-- Name: driving_schools id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_schools ALTER COLUMN id SET DEFAULT nextval('public.driving_schools_id_seq'::regclass);


--
-- Name: driving_test_centers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_test_centers ALTER COLUMN id SET DEFAULT nextval('public.driving_test_centers_id_seq'::regclass);


--
-- Name: driving_test_schedules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_test_schedules ALTER COLUMN id SET DEFAULT nextval('public.driving_test_schedules_id_seq'::regclass);


--
-- Name: email_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_notifications ALTER COLUMN id SET DEFAULT nextval('public.email_notifications_id_seq'::regclass);


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- Name: inspection_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_questions ALTER COLUMN id SET DEFAULT nextval('public.inspection_questions_id_seq'::regclass);


--
-- Name: inspections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspections ALTER COLUMN id SET DEFAULT nextval('public.inspections_id_seq'::regclass);


--
-- Name: license_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_files ALTER COLUMN id SET DEFAULT nextval('public.license_files_id_seq'::regclass);


--
-- Name: licenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses ALTER COLUMN id SET DEFAULT nextval('public.licenses_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: mvaa_offices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mvaa_offices ALTER COLUMN id SET DEFAULT nextval('public.mvaa_offices_id_seq'::regclass);


--
-- Name: nodes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nodes ALTER COLUMN id SET DEFAULT nextval('public.nodes_id_seq'::regclass);


--
-- Name: otps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otps ALTER COLUMN id SET DEFAULT nextval('public.otps_id_seq'::regclass);


--
-- Name: payment_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_settings ALTER COLUMN id SET DEFAULT nextval('public.payment_settings_id_seq'::regclass);


--
-- Name: permits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permits ALTER COLUMN id SET DEFAULT nextval('public.permits_id_seq'::regclass);


--
-- Name: pre_registrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations ALTER COLUMN id SET DEFAULT nextval('public.pre_registrations_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: test_nins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_nins ALTER COLUMN id SET DEFAULT nextval('public.test_nins_id_seq'::regclass);


--
-- Name: training_durations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_durations ALTER COLUMN id SET DEFAULT nextval('public.training_durations_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: api_clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_clients (id, created_at, updated_at, deleted_at, client_name, client_identity, client_email, client_phone, token, is_active, permissions, hash, created_by) FROM stdin;
\.


--
-- Data for Name: applicant_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applicant_files (id, created_at, updated_at, deleted_at, document_type, finger_type, driving_school_id, file_id, driving_school_application_id) FROM stdin;
\.


--
-- Data for Name: audit_trails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_trails (id, created_at, updated_at, deleted_at, user_id, db_action, table_name, resource_id, description) FROM stdin;
\.


--
-- Data for Name: cbt_centers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cbt_centers (id, created_at, updated_at, deleted_at, name, lga_id, state_id, is_active, identifier, phone, email, threshold, devices, address) FROM stdin;
1	2025-06-25 03:01:34.285575	2025-06-25 03:01:34.285575	\N	Dominion CBT Center	518	25	1	\N	09000000022	dominion.cbt@mailinator.com	0	0	\N
\.


--
-- Data for Name: cbt_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cbt_schedules (id, created_at, updated_at, deleted_at, student_id, cbt_center_id, lga_id, transaction_id, state_id, date, "time", score, answers, status, cbt_status, created_by, assessed_by, pre_registration_id, years) FROM stdin;
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devices (id, created_at, updated_at, deleted_at, organization_code, organization_name, license, device_id, device_imei, type, status) FROM stdin;
\.


--
-- Data for Name: driving_school_application_queries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driving_school_application_queries (id, created_at, updated_at, deleted_at, driving_school_id, reason, queried_by_id) FROM stdin;
\.


--
-- Data for Name: driving_school_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driving_school_applications (id, created_at, updated_at, deleted_at, driving_school_id, training_duration_id, reference, nin, application_no, title_id, first_name, middle_name, last_name, maiden_name, email, phone, gender_id, date_of_birth, place_of_birth, nationality_id, state_of_origin_id, lga_of_origin_id, address, occupation_id, marital_status_id, blood_group_id, next_of_kin_name, next_of_kin_phone, next_of_kin_relationship_id, next_of_kin_nationality_id, status, course_level, approved_by_id, approved_at, created_by, height, weight, "eyeColor", "facialMarks", glasses, disability) FROM stdin;
\.


--
-- Data for Name: driving_school_instructors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driving_school_instructors (id, created_at, updated_at, deleted_at, driving_school_id, name, avatar, phone, email, date_of_birth, gender_id, lga_id, state_id, address, is_active, instructor_id, created_by) FROM stdin;
\.


--
-- Data for Name: driving_schools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driving_schools (id, created_at, updated_at, deleted_at, identifier, name, logo, phone, email, address, lga_id, state_id, rc_number, total_vehicles, special_gadgets, total_simulators, teaching_aids, training_range, total_classrooms, classroom_capacity, total_instructors, doc_type, doc_file, is_active, "reasonForSuspension", created_by, reference, status, officer_id, inspection_date, inspection_end_date, vehicle_types) FROM stdin;
1	2025-06-25 03:01:33.392934	2025-06-25 03:01:33.392934	\N	DRCC71TCN4DR	Dominion Driving School	\N	09000000011	dominion.school@mailinator.com	86176 Noel Streets, Lagos-Mainland, Lagos State, 23407, Nigeria	518	25	RC6464848	10	\N	4	\N	\N	10	200	7	\N	\N	1	\N	\N	\N	1	\N	2025-06-25 03:01:33.371	\N	\N
\.


--
-- Data for Name: driving_test_centers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driving_test_centers (id, created_at, updated_at, deleted_at, identifier, name, phone, email, lga_id, state_id, threshold, devices, address, is_active) FROM stdin;
\.


--
-- Data for Name: driving_test_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driving_test_schedules (id, created_at, updated_at, deleted_at, pre_registration_id, driving_test_center_id, license_class_id, lga_id, transaction_id, state_id, date, "time", score, answers, files, vehicle_type, location, booking_status, status, assessed_by, years, student_id) FROM stdin;
\.


--
-- Data for Name: email_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_notifications (id, status, "to", "from", subject, text, html, attachments, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, file_name, bucket_key, bucket_name, mime_type, checksum, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inspection_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspection_questions (id, created_at, updated_at, deleted_at, response, state_id, created_by) FROM stdin;
1	2025-06-25 03:01:34.674932	2025-06-25 03:01:34.674932	\N	[{"id": 1, "options": [{"label": "A. Yes", "marks": 2}, {"label": "B. No", "marks": 0}, {"label": "C. Needs Improvement", "marks": 1}], "category": "License And Accreditation", "question": "Does driving school have licensed instructors with valid certifications?", "correctAnswer": "A. Yes"}, {"id": 2, "options": [{"label": "A. Yes", "marks": 2}, {"label": "B. No", "marks": 0}, {"label": "C. Needs Improvement", "marks": 1}], "category": "Facilities And Equipment", "question": "Driving School has a classroom for theoretical lessons", "correctAnswer": "A. Yes"}, {"id": 3, "options": [{"label": "A. Yes", "marks": 2}, {"label": "B. No", "marks": 0}, {"label": "C. Needs Improvement", "marks": 1}], "category": "Facilities And Equipment", "question": "Driving School has an administrative office for records & operations", "correctAnswer": "A. Yes"}, {"id": 4, "options": [{"label": "A. Yes", "marks": 2}, {"label": "B. No", "marks": 0}, {"label": "C. Needs Improvement", "marks": 1}], "category": "Vehicle And DrivingRange", "question": "Driving School provides a course manual for students", "correctAnswer": "A. Yes"}, {"id": 5, "options": [{"label": "A. Yes", "marks": 2}, {"label": "B. No", "marks": 0}, {"label": "C. Needs Improvement", "marks": 1}], "category": "Vehicle And DrivingRange", "question": "Driving School has copies of the Highway Code for studies", "correctAnswer": "A. Yes"}, {"id": 6, "options": [{"label": "A. Yes", "marks": 2}, {"label": "B. No", "marks": 0}, {"label": "C. Needs Improvement", "marks": 1}], "category": "Learning Materials", "question": "Driving School provides a course manual for students", "correctAnswer": "A. Yes"}, {"id": 7, "options": [{"label": "A. Yes", "marks": 2}, {"label": "B. No", "marks": 0}, {"label": "C. Needs Improvement", "marks": 1}], "category": "Learning Materials", "question": "Driving School has a Traffic Laws & Regulations Handbook", "correctAnswer": "A. Yes"}]	25	1
\.


--
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspections (id, created_at, updated_at, deleted_at, driving_school_id, name, comment, status, month, year, created_by, "totalScore", inspection_result, state_id, query_reasons, acknowledged_inspection) FROM stdin;
\.


--
-- Data for Name: license_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.license_files (id, created_at, updated_at, deleted_at, document_type, finger_type, pre_registration_id, license_id, file_id) FROM stdin;
\.


--
-- Data for Name: licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.licenses (id, created_at, updated_at, deleted_at, pre_registration_id, transaction_id, reference, title_id, first_name, middle_name, last_name, maiden_name, email, phone, license_no, old_license_no, request_type, license_class_id, years, date_of_birth, gender_id, nationality_id, state_id, lga_id, address, station_id, height, weight, serial_number, affidavit_no, status, print_status, issued_by_id, approval_level, issued_at, expiry_at, source, replacement_reason, is_active, created_by, "eyeColor", "facialMarks", glasses, disability) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1744797872542	BdMigrationFix1744797872542
2	1744805941489	ModifyDrivingSchoolApplicationEntity1744805941489
3	1744892725009	AddAdditionalFieldsToApplicantFiles1744892725009
4	1745316287172	AdjustStudentsEntity1745316287172
5	1745319858220	AdjustCbtScheduleEntity1745319858220
6	1745320864215	AddCenterRelationshipCbtScheduleEntity1745320864215
7	1745321793952	AdjustDrivingTestScheduleEntity1745321793952
8	1745322244759	AddDrivingTestCenterMigration1745322244759
9	1745419701512	AddInspectionQuestions1745419701512
10	1745498052809	AddPreRegistrationToCbtSchedules1745498052809
11	1745498510018	AddYearsToSchedules1745498510018
12	1745581080645	AddAcknowledgedInspectionToInspectionEntity1745581080645
13	1746102028706	AddColumnsTocbtCenterEntity1746102028706
14	1746191023258	AddStudentIdRelationToDrivingTestSchedule1746191023258
15	1747045062740	AddedSourceToPermitsTable1747045062740
16	1747050541648	CreateMvaaOfficesTable1747050541648
17	1747726777925	AddModulesToStudentMigration1747726777925
18	1748519617795	AdjusmtentsToDsaLicenseMigration1748519617795
\.


--
-- Data for Name: mvaa_offices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mvaa_offices (id, created_at, updated_at, deleted_at, name, lga_id, state_id, is_active, identifier, phone, email, threshold, devices, address) FROM stdin;
\.


--
-- Data for Name: nodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nodes (id, created_at, updated_at, deleted_at, device_imei, license, device_id, organization_code, organization_name, status, rejection_reason, requester_email, requester_first_name, requester_last_name, requester_phone, type, activated_by) FROM stdin;
\.


--
-- Data for Name: otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otps (id, created_at, updated_at, deleted_at, email, phone, otp, issued_at, is_used) FROM stdin;
\.


--
-- Data for Name: payment_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_settings (id, created_at, updated_at, deleted_at, state_id, lga_id, driving_school_id, name, amount, charges, type, prefix, status, currency) FROM stdin;
1	2025-06-25 03:01:34.626776	2025-06-25 03:01:34.626776	\N	25	518	\N	Pre Registration Payment	12000	100	pre_registration_payment	PR	1	NGN
2	2025-06-25 03:01:34.633675	2025-06-25 03:01:34.633675	\N	25	518	\N	New license Payment	10000	100	new_license_payment	NL	1	NGN
3	2025-06-25 03:01:34.636585	2025-06-25 03:01:34.636585	\N	25	518	\N	Permit Issuance Payment	8000	100	permit_payment	PI	1	NGN
4	2025-06-25 03:01:34.640204	2025-06-25 03:01:34.640204	\N	25	518	\N	License Replacement Payment	2000	100	license_replacement_payment	LRI	1	NGN
5	2025-06-25 03:01:34.643124	2025-06-25 03:01:34.643124	\N	25	518	\N	License Replacement Payment	2000	100	biometrics_payment	BIO	1	NGN
6	2025-06-25 03:01:34.646421	2025-06-25 03:01:34.646421	\N	25	518	\N	License Renewal Payment	11200	100	license_renewal_payment	LR	1	NGN
7	2025-06-25 03:01:34.64916	2025-06-25 03:01:34.64916	\N	25	518	\N	CBT Reschedule Payment	5000	100	cbt_reschedule_payment	CRP	1	NGN
8	2025-06-25 03:01:34.652166	2025-06-25 03:01:34.652166	\N	25	518	3	Driving School Application Payment	4000	100	driving_school_application_payment	DRA	1	NGN
9	2025-06-25 03:01:34.655148	2025-06-25 03:01:34.655148	\N	25	518	\N	Inspection Fee Payment	7500	100	inspection_payment	ISP	1	NGN
10	2025-06-25 03:01:34.658015	2025-06-25 03:01:34.658015	\N	25	518	\N	Driving School Completion Payment	8500	100	driving_school_completion_payment	DCP	1	NGN
\.


--
-- Data for Name: permits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permits (id, created_at, updated_at, deleted_at, student_id, transaction_id, reference, title_id, first_name, middle_name, last_name, maiden_name, email, phone, permit_no, old_permit_no, request_type, permit_class_id, years, date_of_birth, gender_id, nationality_id, state_id, lga_id, address, station_id, serial_number, print_status, issued_by_id, issued_at, expiry_at, replacement_reason, is_active, created_by, source) FROM stdin;
\.


--
-- Data for Name: pre_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pre_registrations (id, created_at, updated_at, deleted_at, application_no, student_id, cbt_center_id, cbt_schedule_id, driving_school_id, driving_test_center_id, driving_test_schedule_id, reference, license_class_id, years, rrr, status, created_by) FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (id, created_at, updated_at, deleted_at, question_text, question_image, options, correct_answer, explanation, difficulty_level, category, time_limit, question_type, created_by) FROM stdin;
1	2025-06-25 03:01:34.308448	2025-06-25 03:01:34.308448	\N	The best way to convey accidents victims to the nearest hospital is by___?	\N	[{"id":"A","text":"Taxi"},{"id":"B","text":"Motorcycle"},{"id":"C","text":"Private"},{"id":"D","text":"Ambulance"}]	A	\N	1	1	10	\N	\N
2	2025-06-25 03:01:34.317204	2025-06-25 03:01:34.317204	\N	Overtaking in a curve is safe provided the Driver is fast	\N	[{"id":"A","text":"True"},{"id":"B","text":"False"}]	B	\N	1	1	10	\N	\N
3	2025-06-25 03:01:34.322127	2025-06-25 03:01:34.322127	\N	Traction is important to car control. Which of the following types of traction is most dangerous?	\N	[{"id":"A","text":"Static traction"},{"id":"B","text":"Sliding traction"},{"id":"C","text":"Rolling traction"},{"id":"D","text":"None"}]	B	\N	1	1	10	\N	\N
4	2025-06-25 03:01:34.326272	2025-06-25 03:01:34.326272	\N	The roles and responsibilities of drivers are as follows except for one	\N	[{"id":"A","text":"Must observe defensive driving technique on the road"},{"id":"B","text":"Insult wrong drivers"},{"id":"C","text":"Communicate effectively"},{"id":"D","text":"Have basic knowledge of auto mechanics"}]	B	\N	1	1	10	\N	\N
5	2025-06-25 03:01:34.330534	2025-06-25 03:01:34.330534	\N	You have driven through a flood. What is the first thing you should do?	\N	[{"id":"A","text":"Switch on your windscreen wipers"},{"id":"B","text":"Stop and check the tires"},{"id":"C","text":"Stop and dry the brakes"},{"id":"D","text":"Test your brake"}]	D	\N	1	1	10	\N	\N
6	2025-06-25 03:01:34.334947	2025-06-25 03:01:34.334947	\N	When approaching a hazard your first reaction should be to	\N	[{"id":"A","text":"Check the mirrors"},{"id":"B","text":"Change direction"},{"id":"C","text":"Release the accelerator"},{"id":"D","text":"Use footbrake"}]	A	\N	1	1	10	\N	\N
7	2025-06-25 03:01:34.339066	2025-06-25 03:01:34.339066	\N	To pass a slower-moving vehicle on a two-lane road you must do all this except	\N	[{"id":"A","text":"Cross the centerline"},{"id":"B","text":"Use the shoulder"},{"id":"C","text":"Flash your lights"},{"id":"D","text":"Use that lane that belongs to oncoming traffic"}]	A	\N	1	1	10	\N	\N
8	2025-06-25 03:01:34.343414	2025-06-25 03:01:34.343414	\N	How many types of roundabouts do we have?	\N	[{"id":"A","text":"4"},{"id":"B","text":"5"},{"id":"C","text":"1"},{"id":"D","text":"2"}]	D	\N	1	1	10	\N	\N
9	2025-06-25 03:01:34.34755	2025-06-25 03:01:34.34755	\N	If there are no signals at a railroad crossing you should:	\N	[{"id":"A","text":"Slow down and prepare to stop"},{"id":"B","text":"Proceed through the crossing at a normal rate"},{"id":"C","text":"If you see or hear a train coming proceed as quickly as possible over the track"},{"id":"D","text":"Proceed slowly over the tracks"}]	A	\N	1	1	10	\N	\N
10	2025-06-25 03:01:34.351586	2025-06-25 03:01:34.351586	\N	To help a driver see better at night, the driver should:	\N	[{"id":"A","text":"Wear sunglasses to reduce headlight glare"},{"id":"B","text":"Use high beam headlights when safe and legal to do so"},{"id":"C","text":"Turn on all interior lights"},{"id":"D","text":"Drive only in the city where there are street lights"}]	B	\N	1	1	10	\N	\N
11	2025-06-25 03:01:34.355639	2025-06-25 03:01:34.355639	\N	One of the major factors of the causes of road traffic crashes	\N	[{"id":"A","text":"The road signs"},{"id":"B","text":"The street lights"},{"id":"C","text":"The driver"},{"id":"D","text":"All of the above"}]	D	\N	1	1	10	\N	\N
12	2025-06-25 03:01:34.359564	2025-06-25 03:01:34.359564	\N	If a vehicle using high beams comes towards you, you should look towards_____ of the road	\N	[{"id":"A","text":"Either side"},{"id":"B","text":"The right side"},{"id":"C","text":"The left side"},{"id":"D","text":"B & C"}]	D	\N	1	1	10	\N	\N
13	2025-06-25 03:01:34.365329	2025-06-25 03:01:34.365329	\N	Allowing a space cushion is important because it	\N	[{"id":"A","text":"Prevents distraction from other vehicles"},{"id":"B","text":"Gives you time and space to react to a situation"},{"id":"C","text":"Puts other drivers alert"},{"id":"D","text":"None of the above"}]	B	\N	1	1	10	\N	\N
14	2025-06-25 03:01:34.369327	2025-06-25 03:01:34.369327	\N	The following are different parking except one:	\N	[{"id":"A","text":"Angle or angular parking"},{"id":"B","text":"Car parking"},{"id":"C","text":"Perpendicular parking"},{"id":"D","text":"Parallel parking"}]	B	\N	1	1	10	\N	\N
15	2025-06-25 03:01:34.37312	2025-06-25 03:01:34.37312	\N	Being overconfident can affect the performance of the driver and lead to an accident	\N	[{"id":"A","text":"True"},{"id":"B","text":"False"}]	A	\N	1	1	10	\N	\N
16	2025-06-25 03:01:34.376778	2025-06-25 03:01:34.376778	\N	When driving on a highway, sudden strong crosswind gusts:	\N	[{"id":"A","text":"Always cause severe dust problems"},{"id":"B","text":"Affect large cars more than small cars"},{"id":"C","text":"Can move a car sideways into another lane"},{"id":"D","text":"Do not affect a car as much as a strong headwind"}]	B	\N	1	1	10	\N	\N
17	2025-06-25 03:01:34.380507	2025-06-25 03:01:34.380507	\N	If there are no signals at a railroad crossing you should:	\N	[{"id":"A","text":"Slow down and prepare to stop"},{"id":"B","text":"Proceed through the crossing at a normal rate"},{"id":"C","text":"If you see or hear a train coming proceed as quickly as possible over the track"},{"id":"D","text":"Proceed slowly over the tracks"}]	A	\N	1	1	10	\N	\N
18	2025-06-25 03:01:34.384377	2025-06-25 03:01:34.384377	\N	Preparing to smoke and smoking while driving	\N	[{"id":"A","text":"Do not affect driving abilities"},{"id":"B","text":"Are distracting activities"},{"id":"C","text":"Help maintain a driver's alertness"},{"id":"D","text":"Are not distracting activities"}]	B	\N	1	1	10	\N	\N
19	2025-06-25 03:01:34.387689	2025-06-25 03:01:34.387689	\N	When a minor crash occurs, the first thing to do is to	\N	[{"id":"A","text":"Report to the police"},{"id":"B","text":"Mark the position of the four tires"},{"id":"C","text":"Stop the vehicle"},{"id":"D","text":"Runaway from the accident scene"}]	A	\N	1	1	10	\N	\N
20	2025-06-25 03:01:34.390994	2025-06-25 03:01:34.390994	\N	Before starting the engine of a vehicle you should:	\N	[{"id":"A","text":"Check radiator water level and engine oil level"},{"id":"B","text":"Check headlight"},{"id":"C","text":"Check the brakes"},{"id":"D","text":"None of the above"}]	A	\N	1	1	10	\N	\N
21	2025-06-25 03:01:34.394732	2025-06-25 03:01:34.394732	\N	The middle lane is for what?	\N	[{"id":"A","text":"Overtaking"},{"id":"B","text":"Traffic driving at 40 km/hr"},{"id":"C","text":"Two wheelers"},{"id":"D","text":"None of the above"}]	B	\N	1	1	10	\N	\N
22	2025-06-25 03:01:34.445187	2025-06-25 03:01:34.445187	\N	What does this road sign represent?	img14.jpg	[{"id":"A","text":"Approaching traffic passes you on both sides"},{"id":"B","text":"Pass either sides to get to the same destination"},{"id":"C","text":"Turn off at the next available junction"},{"id":"D","text":"Give way to oncoming vehicles"}]	B	\N	1	1	10	\N	\N
23	2025-06-25 03:01:34.455815	2025-06-25 03:01:34.455815	\N	You were driving, when you got to a junction, you found a stop sign with a solid white line on the road surface as seen in the image below. Why is there a stop sign at the junction?	img16.jpg	[{"id":"A","text":"It is a busy junction"},{"id":"B","text":"Visibility among the major road is restricted"},{"id":"C","text":"There are hazard warning lines in the centre of the road"},{"id":"D","text":"Speed on the major road is de- restricted"}]	B	\N	1	1	10	\N	\N
24	2025-06-25 03:01:34.463423	2025-06-25 03:01:34.463423	\N	Where will you find the road sign marking below?	img17.jpg	[{"id":"A","text":"On a pedestrian crossing"},{"id":"B","text":"On a motorway"},{"id":"C","text":"At a junction"},{"id":"D","text":"At a railway crossing"}]	A	\N	1	1	10	\N	\N
25	2025-06-25 03:01:34.473349	2025-06-25 03:01:34.473349	\N	What does the road sign below represent?	img20.jpg	[{"id":"A","text":"Motorway contraflow system ahead"},{"id":"B","text":"Traffic approaching you have priority"},{"id":"C","text":"Two-way traffic straight ahead"},{"id":"D","text":"Two-way traffic ahead across a one way street"}]	C	\N	1	1	10	\N	\N
26	2025-06-25 03:01:34.486648	2025-06-25 03:01:34.486648	\N	You are driving through a road, and all of a sudden you see the road sign below. What does this sign mean?	img21.jpg	[{"id":"A","text":"Overtaking on the left only"},{"id":"B","text":"Move over onto the hard shoulder"},{"id":"C","text":"Move to the lane on your left "},{"id":"D","text":"Leave the motorway at the next exit"}]	D	\N	1	1	10	\N	\N
27	2025-06-25 03:01:34.49734	2025-06-25 03:01:34.49734	\N	Which of these is odd?	\N	[{"id":"A","text":"Seat belts"},{"id":"B","text":"Clutch"},{"id":"C","text":"Brake"},{"id":"D","text":"Helmets"}]	D	\N	1	1	10	\N	\N
28	2025-06-25 03:01:34.501304	2025-06-25 03:01:34.501304	\N	After starting a car, what is the next thing to do?	\N	[{"id":"A","text":"Touching your mirrors"},{"id":"B","text":"Turning the wheel"},{"id":"C","text":"Setting the transmission to the correct gear"},{"id":"D","text":"Trying the acceleration gear"}]	C	\N	1	1	10	\N	\N
29	2025-06-25 03:01:34.50548	2025-06-25 03:01:34.50548	\N	In which country were the first numeric speed limits created?	\N	[{"id":"A","text":"In the UK"},{"id":"B","text":"In the USA"},{"id":"C","text":"In the New Zealand"},{"id":"D","text":"In Sweden"}]	A	\N	1	1	10	\N	\N
30	2025-06-25 03:01:34.513335	2025-06-25 03:01:34.513335	\N	What does the road sign below represent?	img24.jpg	[{"id":"A","text":"Passing is permitted"},{"id":"B","text":"No pedestrian allowed"},{"id":"C","text":"Do not pass"},{"id":"D","text":"Crowded movement not allowed"}]	C	\N	1	1	10	\N	\N
31	2025-06-25 03:01:34.5164	2025-06-25 03:01:34.5164	\N	Which of the following road signs have blue and red colours in them?	\N	[{"id":"A","text":"Mandatory and information signs"},{"id":"B","text":"Regulatory signs and no parking"},{"id":"C","text":"No waiting and no stopping"},{"id":"D","text":"No entry and no stopping"}]	C	\N	1	1	10	\N	\N
32	2025-06-25 03:01:34.520473	2025-06-25 03:01:34.520473	\N	What is the offence code for operating a vehicle with forged documents?	\N	[{"id":"A","text":"OFD"},{"id":"B","text":"OFV"},{"id":"C","text":"OVF"},{"id":"D","text":"FOV"}]	A	\N	1	1	10	\N	\N
33	2025-06-25 03:01:34.524114	2025-06-25 03:01:34.524114	\N	The line drawn on the road as a result of emergency application of break is called?	\N	[{"id":"A","text":"Point of impact"},{"id":"B","text":"Skid mark"},{"id":"C","text":"Zebra mark"},{"id":"D","text":"Point of collision"}]	B	\N	1	1	10	\N	\N
34	2025-06-25 03:01:34.527991	2025-06-25 03:01:34.527991	\N	What is the last group in the list of driving license categories in Nigeria?	\N	[{"id":"A","text":"Group Z"},{"id":"B","text":"Group V"},{"id":"C","text":"Group J"},{"id":"D","text":"Group A"}]	A	\N	1	1	10	\N	\N
35	2025-06-25 03:01:34.531938	2025-06-25 03:01:34.531938	\N	Road traffic crashes are divided into three main categories, namely?	\N	[{"id":"A","text":"Major, severe and fatal"},{"id":"B","text":"Minor, severe and fatal"},{"id":"C","text":"Major, serious and fatal"},{"id":"D","text":"Minor, serious and fatal"}]	D	\N	1	1	10	\N	\N
36	2025-06-25 03:01:34.535204	2025-06-25 03:01:34.535204	\N	Caution sign with red colour inverted triangles means?	\N	[{"id":"A","text":"Give Way"},{"id":"B","text":"Go Ahead"},{"id":"C","text":"Turn Left"},{"id":"D","text":"Go Straight"}]	A	\N	1	1	10	\N	\N
37	2025-06-25 03:01:34.538825	2025-06-25 03:01:34.538825	\N	At the roundabout you give way to the traffic on the_______?	\N	[{"id":"A","text":"Right"},{"id":"B","text":"Rear"},{"id":"C","text":"Left"},{"id":"D","text":"Front"}]	C	\N	1	1	10	\N	\N
38	2025-06-25 03:01:34.542731	2025-06-25 03:01:34.542731	\N	To move a vehicle from a stationary position, the sequence of operation is:	\N	[{"id":"A","text":"Mirror-Start-Signal-Move"},{"id":"B","text":"Start -Gear- Mirror -Signal -Move"},{"id":"C","text":"Start -Mirror -Signal - Gear -Move"},{"id":"D","text":"Signal -Start, Mirror - Move"}]	C	\N	1	1	10	\N	\N
39	2025-06-25 03:01:34.546662	2025-06-25 03:01:34.546662	\N	There is a rule you need to take as to easily know if you are maintaining a safe driving distance. What is this rule called?	\N	[{"id":"A","text":"The three second rule"},{"id":"B","text":"The half second rule"},{"id":"C","text":"The one second rule"},{"id":"D","text":"The two second rule"}]	D	\N	1	1	10	\N	\N
40	2025-06-25 03:01:34.559957	2025-06-25 03:01:34.559957	\N	At which of the traffic signals below may you move on if you are in the left-hand lane at traffic signals and you are waiting to turn left?	img29.jpg	[{"id":"A","text":"A"},{"id":"B","text":"B"},{"id":"C","text":"C"},{"id":"D","text":"D"}]	B	\N	1	1	10	\N	\N
41	2025-06-25 03:01:34.563547	2025-06-25 03:01:34.563547	\N	When near a pedestrian crossing,as the pedestrians are waiting to cross the road, what should you do?	\N	[{"id":"A","text":"Sound horn and proceed"},{"id":"B","text":"Slow down, sound horn and pass"},{"id":"C","text":"Stop the vehicle and wait till the pedestrians cross the road and then proceed."},{"id":"D","text":"None of the above"}]	C	\N	1	1	10	\N	\N
42	2025-06-25 03:01:34.569132	2025-06-25 03:01:34.569132	\N	A person driving a vehicle in a public place without a license is liable for:	\N	[{"id":"A","text":"Penalty only"},{"id":"B","text":"Penalty for the driver and the owner and/ or a seizure of the vehicle"},{"id":"C","text":"Warning"},{"id":"D","text":"None of the above"}]	B	\N	1	1	10	\N	\N
43	2025-06-25 03:01:34.57525	2025-06-25 03:01:34.57525	\N	While parking your vehicle on a downward gradient, in addition to the application of hand brake, the gear engaged should be:	\N	[{"id":"A","text":"In neutral"},{"id":"B","text":"In first"},{"id":"C","text":"In reverse"},{"id":"D","text":"None of the above"}]	C	\N	1	1	10	\N	\N
44	2025-06-25 03:01:34.582093	2025-06-25 03:01:34.582093	\N	When a vehicle is involved in an accident causing injury to any person. What should you do?	\N	[{"id":"A","text":"Take the vehicle to the nearest police station and report the accident."},{"id":"B","text":"Stop the vehicle and report to the police station"},{"id":"C","text":"Take all reasonable steps to secure medical attention to the injured and report to the nearest police station within 24 hours."},{"id":"D","text":"None of the above"}]	C	\N	1	1	10	\N	\N
45	2025-06-25 03:01:34.591358	2025-06-25 03:01:34.591358	\N	On a road designated as one way, which of the following hold true?	\N	[{"id":"A","text":"Parking is prohibited"},{"id":"B","text":"Overtaking is prohibited"},{"id":"C","text":"Should not drive in reverse gear"},{"id":"D","text":"None of the above"}]	C	\N	1	1	10	\N	\N
46	2025-06-25 03:01:34.594519	2025-06-25 03:01:34.594519	\N	When a blind person is crossing the road, holding a white cane, the driver should:	\N	[{"id":"A","text":"Consider the white cane as a traffic sign to stop the vehicle"},{"id":"B","text":"Blow the horn and proceed"},{"id":"C","text":"Slow down and proceed with caution"},{"id":"D","text":"None of the above"}]	A	\N	1	1	10	\N	\N
47	2025-06-25 03:01:34.600134	2025-06-25 03:01:34.600134	\N	When you reach an intersection where there is no signal light or a traffic policeman you should:	\N	[{"id":"A","text":"Give way to traffic approaching the intersection from other roads"},{"id":"B","text":"Give proper signal, sound the horn and then proceed"},{"id":"C","text":"Give way to the traffic approaching the intersection on your right side and proceed after giving necessary signals"},{"id":"D","text":"None of the above"}]	C	\N	1	1	10	\N	\N
48	2025-06-25 03:01:34.603566	2025-06-25 03:01:34.603566	\N	When is overtaking prohibited?	\N	[{"id":"A","text":"When the road is marked with a broken center line in the colour white"},{"id":"B","text":"When the vehicle is being driven on a steep hill"},{"id":"C","text":"When the road is marked with a continuous center line in the colour yellow"},{"id":"D","text":"None of the above"}]	B	\N	1	1	10	\N	\N
49	2025-06-25 03:01:34.606473	2025-06-25 03:01:34.606473	\N	What is the meaning of a blinking red traffic light?	\N	[{"id":"A","text":"Stop the vehicle till green light glows"},{"id":"B","text":"Stop the vehicle and proceed if safe"},{"id":"C","text":"Reduce speed and proceed"},{"id":"D","text":"None of the above"}]	B	\N	1	1	10	\N	\N
50	2025-06-25 03:01:34.609417	2025-06-25 03:01:34.609417	\N	Maximum permitted speed of a car on national highway is:	\N	[{"id":"A","text":"60 km/hr"},{"id":"B","text":"70 km/hr"},{"id":"C","text":"80 km/hr"},{"id":"D","text":"None of the above"}]	B	\N	1	1	10	\N	\N
51	2025-06-25 03:01:34.615144	2025-06-25 03:01:34.615144	\N	Where is the number of passengers permitted to be taken in a private vehicle recorded?	\N	[{"id":"A","text":"Registration Certificate"},{"id":"B","text":"Tax Token"},{"id":"C","text":"Permit"},{"id":"D","text":"None of the above"}]	A	\N	1	1	10	\N	\N
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, created_at, updated_at, deleted_at, driving_school_id, application_id, student_no, certificate_no, is_active, graduated, created_by, modules) FROM stdin;
\.


--
-- Data for Name: test_nins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_nins (id, nin, data) FROM stdin;
\.


--
-- Data for Name: training_durations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.training_durations (id, created_at, updated_at, deleted_at, driving_school_id, duration, duration_text, is_active, created_by) FROM stdin;
1	2025-06-25 03:01:34.263829	2025-06-25 03:01:34.263829	\N	1	3	3 Months	1	\N
2	2025-06-25 03:01:34.275925	2025-06-25 03:01:34.275925	\N	1	6	6 Months	1	\N
3	2025-06-25 03:01:34.280076	2025-06-25 03:01:34.280076	\N	1	9	9 Months	1	\N
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, created_at, updated_at, deleted_at, user_id, email, amount, status, reference, channel, type, currency, log, item_type, item_id, provider, used, charges, refunded, success_redirect_url, failure_redirect_url) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, middle_name, last_name, phone, email, avatar, address, state_id, lga_id, driving_school_id, role_id, role_name, change_password_next_login, password, device, last_password_change, is_active, files, access_token, permissions, created_at, updated_at, node_id) FROM stdin;
1	Super	August	Admin	09000000001	super.admin@mailinator.com	\N	\N	25	518	\N	2	Admin	0	$2b$10$RHBTvZhftQV7fVV8XekYyOeX/EJuwWd1FFlRTvUd1c4fvbO3Ay4g2	\N	2025-06-25 03:01:33.632705	1	\N	\N	\N	2025-06-25 03:01:33.632705	2025-06-25 03:01:33.632705	\N
2	Lasdri	Emerson	Officer	09000000002	lasdri.officer@mailinator.com	\N	\N	25	518	\N	6	State Driver's Institute	0	$2b$10$5bQJX5qm1DDvv9tsyOehHejvuy.o7kJVPW8wWImErtt2bkxR8rcFO	\N	2025-06-25 03:01:33.904462	1	\N	\N	\N	2025-06-25 03:01:33.904462	2025-06-25 03:01:33.904462	\N
3	Josiah	Addison	Adgbola	09000000002	josiah.adgbola@mailinator.com	\N	\N	25	518	1	3	School Administrator	0	$2b$10$5y.ynTn2vjdCTSqOLRP2g.p/tHLWTlr.U6z3O6Z2RH/BGu4aZg8Xq	\N	2025-06-25 03:01:34.167711	1	\N	\N	\N	2025-06-25 03:01:34.167711	2025-06-25 03:01:34.167711	\N
\.


--
-- Name: api_clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.api_clients_id_seq', 1, false);


--
-- Name: applicant_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applicant_files_id_seq', 1, false);


--
-- Name: audit_trails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_trails_id_seq', 1, false);


--
-- Name: cbt_centers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cbt_centers_id_seq', 1, true);


--
-- Name: cbt_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cbt_schedules_id_seq', 1, false);


--
-- Name: devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.devices_id_seq', 1, false);


--
-- Name: driving_school_application_queries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driving_school_application_queries_id_seq', 1, false);


--
-- Name: driving_school_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driving_school_applications_id_seq', 1, false);


--
-- Name: driving_school_instructors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driving_school_instructors_id_seq', 1, false);


--
-- Name: driving_schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driving_schools_id_seq', 1, true);


--
-- Name: driving_test_centers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driving_test_centers_id_seq', 1, false);


--
-- Name: driving_test_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driving_test_schedules_id_seq', 1, false);


--
-- Name: email_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_notifications_id_seq', 1, false);


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.files_id_seq', 1, false);


--
-- Name: inspection_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inspection_questions_id_seq', 1, true);


--
-- Name: inspections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inspections_id_seq', 1, false);


--
-- Name: license_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.license_files_id_seq', 1, false);


--
-- Name: licenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.licenses_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 18, true);


--
-- Name: mvaa_offices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mvaa_offices_id_seq', 1, false);


--
-- Name: nodes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nodes_id_seq', 1, false);


--
-- Name: otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.otps_id_seq', 1, false);


--
-- Name: payment_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_settings_id_seq', 10, true);


--
-- Name: permits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permits_id_seq', 1, false);


--
-- Name: pre_registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pre_registrations_id_seq', 1, false);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questions_id_seq', 51, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_id_seq', 1, false);


--
-- Name: test_nins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_nins_id_seq', 1, false);


--
-- Name: training_durations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.training_durations_id_seq', 3, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: training_durations PK_006ff01d0826713ff5207e50735; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_durations
    ADD CONSTRAINT "PK_006ff01d0826713ff5207e50735" PRIMARY KEY (id);


--
-- Name: applicant_files PK_014e3d58f21dcc904100821c626; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicant_files
    ADD CONSTRAINT "PK_014e3d58f21dcc904100821c626" PRIMARY KEY (id);


--
-- Name: license_files PK_0261de7d4b9a03665174337a955; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_files
    ADD CONSTRAINT "PK_0261de7d4b9a03665174337a955" PRIMARY KEY (id);


--
-- Name: questions PK_08a6d4b0f49ff300bf3a0ca60ac; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY (id);


--
-- Name: inspection_questions PK_0bf82b858a440bf132c41bf0142; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_questions
    ADD CONSTRAINT "PK_0bf82b858a440bf132c41bf0142" PRIMARY KEY (id);


--
-- Name: driving_schools PK_34001621d490072566ecd145685; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_schools
    ADD CONSTRAINT "PK_34001621d490072566ecd145685" PRIMARY KEY (id);


--
-- Name: driving_school_applications PK_3b1ef95fbf42bdbd4e19ebb6273; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_applications
    ADD CONSTRAINT "PK_3b1ef95fbf42bdbd4e19ebb6273" PRIMARY KEY (id);


--
-- Name: driving_school_instructors PK_5b5116202701db175c6017993da; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_instructors
    ADD CONSTRAINT "PK_5b5116202701db175c6017993da" PRIMARY KEY (id);


--
-- Name: driving_test_centers PK_5c3931b2feb63135aefe6ff1da1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_test_centers
    ADD CONSTRAINT "PK_5c3931b2feb63135aefe6ff1da1" PRIMARY KEY (id);


--
-- Name: nodes PK_682d6427523a0fa43d062ea03ee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT "PK_682d6427523a0fa43d062ea03ee" PRIMARY KEY (id);


--
-- Name: files PK_6c16b9093a142e0e7613b04a3d9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY (id);


--
-- Name: payment_settings PK_78624861ce2178d6835fb1d9fdf; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_settings
    ADD CONSTRAINT "PK_78624861ce2178d6835fb1d9fdf" PRIMARY KEY (id);


--
-- Name: students PK_7d7f07271ad4ce999880713f05e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY (id);


--
-- Name: test_nins PK_832792e0495c8c16ca2606732a1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_nins
    ADD CONSTRAINT "PK_832792e0495c8c16ca2606732a1" PRIMARY KEY (id);


--
-- Name: cbt_centers PK_86a16b29f2e381d64126ac91ff5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cbt_centers
    ADD CONSTRAINT "PK_86a16b29f2e381d64126ac91ff5" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: cbt_schedules PK_8e281b5e3509e0a0478814d0cb1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cbt_schedules
    ADD CONSTRAINT "PK_8e281b5e3509e0a0478814d0cb1" PRIMARY KEY (id);


--
-- Name: audit_trails PK_91440e9d8998d3faf5f8cd6b9ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_trails
    ADD CONSTRAINT "PK_91440e9d8998d3faf5f8cd6b9ab" PRIMARY KEY (id);


--
-- Name: otps PK_91fef5ed60605b854a2115d2410; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY (id);


--
-- Name: driving_school_application_queries PK_9548e7cb06affa767aa6a3ae2d8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_application_queries
    ADD CONSTRAINT "PK_9548e7cb06affa767aa6a3ae2d8" PRIMARY KEY (id);


--
-- Name: transactions PK_a219afd8dd77ed80f5a862f1db9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: inspections PK_a484980015782324454d8c88abe; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT "PK_a484980015782324454d8c88abe" PRIMARY KEY (id);


--
-- Name: devices PK_b1514758245c12daf43486dd1f0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY (id);


--
-- Name: licenses PK_da5021501ce80efa03de6f40086; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT "PK_da5021501ce80efa03de6f40086" PRIMARY KEY (id);


--
-- Name: pre_registrations PK_e0a4d8e6464a13507772dbf1020; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations
    ADD CONSTRAINT "PK_e0a4d8e6464a13507772dbf1020" PRIMARY KEY (id);


--
-- Name: permits PK_e0f39993461b6ea160b4f42ac1c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permits
    ADD CONSTRAINT "PK_e0f39993461b6ea160b4f42ac1c" PRIMARY KEY (id);


--
-- Name: api_clients PK_ef2d5ef0eb5e9a6ddc67cfa310e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_clients
    ADD CONSTRAINT "PK_ef2d5ef0eb5e9a6ddc67cfa310e" PRIMARY KEY (id);


--
-- Name: driving_test_schedules PK_efda6a6ccc5f42181ee4fd685b6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_test_schedules
    ADD CONSTRAINT "PK_efda6a6ccc5f42181ee4fd685b6" PRIMARY KEY (id);


--
-- Name: email_notifications PK_f4d8ce5003f1ce04365090df2d2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT "PK_f4d8ce5003f1ce04365090df2d2" PRIMARY KEY (id);


--
-- Name: mvaa_offices PK_fd483a1b55c423d083e929745aa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mvaa_offices
    ADD CONSTRAINT "PK_fd483a1b55c423d083e929745aa" PRIMARY KEY (id);


--
-- Name: permits REL_433cfbb801e2b7bc7ccd3c1679; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permits
    ADD CONSTRAINT "REL_433cfbb801e2b7bc7ccd3c1679" UNIQUE (student_id);


--
-- Name: driving_schools UQ_061635c6ddbadf4df770ff352c4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_schools
    ADD CONSTRAINT "UQ_061635c6ddbadf4df770ff352c4" UNIQUE (email);


--
-- Name: students UQ_19d8473ff6649ea86a6789bde37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "UQ_19d8473ff6649ea86a6789bde37" UNIQUE (certificate_no);


--
-- Name: otps UQ_1eb34b74b10a82b8ebc6f4cdb0c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT "UQ_1eb34b74b10a82b8ebc6f4cdb0c" UNIQUE (otp);


--
-- Name: pre_registrations UQ_20ba265ddbe5b9831a8030d04fb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations
    ADD CONSTRAINT "UQ_20ba265ddbe5b9831a8030d04fb" UNIQUE (rrr);


--
-- Name: cbt_schedules UQ_4119af6ebf2d26370ab9115ecf9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cbt_schedules
    ADD CONSTRAINT "UQ_4119af6ebf2d26370ab9115ecf9" UNIQUE (pre_registration_id);


--
-- Name: test_nins UQ_4500f9433b40058406bd975f782; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_nins
    ADD CONSTRAINT "UQ_4500f9433b40058406bd975f782" UNIQUE (nin);


--
-- Name: licenses UQ_48ce52df7f77e6ba2c07cee8533; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT "UQ_48ce52df7f77e6ba2c07cee8533" UNIQUE (reference);


--
-- Name: students UQ_4d1c863a1e6a72f53df78b11a17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "UQ_4d1c863a1e6a72f53df78b11a17" UNIQUE (student_no);


--
-- Name: driving_school_applications UQ_58271953a12e51dd9c53a6617e4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_applications
    ADD CONSTRAINT "UQ_58271953a12e51dd9c53a6617e4" UNIQUE (reference);


--
-- Name: api_clients UQ_598eec97e5df3dc851d889162fc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_clients
    ADD CONSTRAINT "UQ_598eec97e5df3dc851d889162fc" UNIQUE (client_phone);


--
-- Name: driving_school_instructors UQ_670d554ab2ef8059dd5c13fb01e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_instructors
    ADD CONSTRAINT "UQ_670d554ab2ef8059dd5c13fb01e" UNIQUE (email);


--
-- Name: driving_school_instructors UQ_748227e939e6e8d24c450ddc344; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_instructors
    ADD CONSTRAINT "UQ_748227e939e6e8d24c450ddc344" UNIQUE (instructor_id);


--
-- Name: api_clients UQ_77ad9ce55ee6c38c0f0a4c3bc03; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_clients
    ADD CONSTRAINT "UQ_77ad9ce55ee6c38c0f0a4c3bc03" UNIQUE (client_email);


--
-- Name: pre_registrations UQ_7e23a64155b2163b98ae1b80f71; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations
    ADD CONSTRAINT "UQ_7e23a64155b2163b98ae1b80f71" UNIQUE (application_no);


--
-- Name: devices UQ_847ab956ae9529fdb898669bb30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT "UQ_847ab956ae9529fdb898669bb30" UNIQUE (device_imei);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: driving_schools UQ_9d981a234d4a345669b83ee144d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_schools
    ADD CONSTRAINT "UQ_9d981a234d4a345669b83ee144d" UNIQUE (identifier);


--
-- Name: licenses UQ_a3670a9ecaff524fb2c1c1c21bb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT "UQ_a3670a9ecaff524fb2c1c1c21bb" UNIQUE (license_no);


--
-- Name: pre_registrations UQ_a7e16cc8a5e1c4a804d32f1a83b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations
    ADD CONSTRAINT "UQ_a7e16cc8a5e1c4a804d32f1a83b" UNIQUE (reference);


--
-- Name: users UQ_ac2cb1ba4f8955eacc79388c468; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_ac2cb1ba4f8955eacc79388c468" UNIQUE (device);


--
-- Name: driving_schools UQ_b6050900ae84e59d45b833aaf97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_schools
    ADD CONSTRAINT "UQ_b6050900ae84e59d45b833aaf97" UNIQUE (reference);


--
-- Name: permits UQ_d6454872d5feb5295a40b4636c8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permits
    ADD CONSTRAINT "UQ_d6454872d5feb5295a40b4636c8" UNIQUE (permit_no);


--
-- Name: transactions UQ_dd85cc865e0c3d5d4be095d3f3f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "UQ_dd85cc865e0c3d5d4be095d3f3f" UNIQUE (reference);


--
-- Name: driving_school_applications UQ_dea21a95c06cf8bce28a6f8e362; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_applications
    ADD CONSTRAINT "UQ_dea21a95c06cf8bce28a6f8e362" UNIQUE (application_no);


--
-- Name: api_clients UQ_e8aa2cf0d04c127a9ba896ad907; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_clients
    ADD CONSTRAINT "UQ_e8aa2cf0d04c127a9ba896ad907" UNIQUE (client_identity);


--
-- Name: permits UQ_f686c353be051e0742736f4da8b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permits
    ADD CONSTRAINT "UQ_f686c353be051e0742736f4da8b" UNIQUE (reference);


--
-- Name: IDX_009bd7c3107edbb1ae7b224083; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_009bd7c3107edbb1ae7b224083" ON public.email_notifications USING btree ("from");


--
-- Name: IDX_061635c6ddbadf4df770ff352c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_061635c6ddbadf4df770ff352c" ON public.driving_schools USING btree (email);


--
-- Name: IDX_06bb98c99b78ced7d5bc9b58d8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_06bb98c99b78ced7d5bc9b58d8" ON public.licenses USING btree (issued_by_id);


--
-- Name: IDX_0b20608008f11b84f31ee406ff; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0b20608008f11b84f31ee406ff" ON public.permits USING btree (is_active);


--
-- Name: IDX_1578bdc0ea5d84c90e79a79408; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1578bdc0ea5d84c90e79a79408" ON public.driving_school_applications USING btree (email);


--
-- Name: IDX_157c4c323f2618c789fe25d06a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_157c4c323f2618c789fe25d06a" ON public.permits USING btree (state_id);


--
-- Name: IDX_1829435baf2ada0644858ba236; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1829435baf2ada0644858ba236" ON public.permits USING btree (email);


--
-- Name: IDX_18c8f9e8e1e4fdf492d269f54f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_18c8f9e8e1e4fdf492d269f54f" ON public.driving_school_applications USING btree (approved_by_id);


--
-- Name: IDX_19d8473ff6649ea86a6789bde3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_19d8473ff6649ea86a6789bde3" ON public.students USING btree (certificate_no);


--
-- Name: IDX_1afe7206f551457424304c16d3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1afe7206f551457424304c16d3" ON public.driving_schools USING btree (status);


--
-- Name: IDX_1d776044c0c89e96314a586bd4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1d776044c0c89e96314a586bd4" ON public.permits USING btree (permit_class_id);


--
-- Name: IDX_1e6d6cbe6e6f28e1f225af0d94; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1e6d6cbe6e6f28e1f225af0d94" ON public.cbt_schedules USING btree (state_id);


--
-- Name: IDX_1f43855b724993f397ce65a9d7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1f43855b724993f397ce65a9d7" ON public.devices USING btree (organization_code);


--
-- Name: IDX_20ba265ddbe5b9831a8030d04f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_20ba265ddbe5b9831a8030d04f" ON public.pre_registrations USING btree (rrr);


--
-- Name: IDX_20c7aea6112bef71528210f631; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_20c7aea6112bef71528210f631" ON public.users USING btree (is_active);


--
-- Name: IDX_20d52f823ecb6a55c9c6122ddc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_20d52f823ecb6a55c9c6122ddc" ON public.pre_registrations USING btree (license_class_id);


--
-- Name: IDX_2a51209fbc263b29a91a5b6e79; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2a51209fbc263b29a91a5b6e79" ON public.permits USING btree (issued_by_id);


--
-- Name: IDX_2d5fa024a84dceb158b2b95f34; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2d5fa024a84dceb158b2b95f34" ON public.transactions USING btree (type);


--
-- Name: IDX_3151ce9870afc06c1afc8f99ef; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3151ce9870afc06c1afc8f99ef" ON public.training_durations USING btree (is_active);


--
-- Name: IDX_3306027370644a0e62c695a674; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3306027370644a0e62c695a674" ON public.driving_school_applications USING btree (lga_of_origin_id);


--
-- Name: IDX_33206384cc0a56e1d8d0a0cc47; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_33206384cc0a56e1d8d0a0cc47" ON public.otps USING btree (phone);


--
-- Name: IDX_370c6420f7ba4941df923396f0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_370c6420f7ba4941df923396f0" ON public.questions USING btree (difficulty_level);


--
-- Name: IDX_398cf36aea9b3e50aba76668da; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_398cf36aea9b3e50aba76668da" ON public.licenses USING btree (print_status);


--
-- Name: IDX_3a916d9d66181d5a275bee5778; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3a916d9d66181d5a275bee5778" ON public.audit_trails USING btree (resource_id);


--
-- Name: IDX_433cfbb801e2b7bc7ccd3c1679; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_433cfbb801e2b7bc7ccd3c1679" ON public.permits USING btree (student_id);


--
-- Name: IDX_48ce52df7f77e6ba2c07cee853; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_48ce52df7f77e6ba2c07cee853" ON public.licenses USING btree (reference);


--
-- Name: IDX_48eb0c80a3507b9decdc278209; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_48eb0c80a3507b9decdc278209" ON public.licenses USING btree (lga_id);


--
-- Name: IDX_49afc6f3070c0cc5407075e232; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_49afc6f3070c0cc5407075e232" ON public.licenses USING btree (state_id);


--
-- Name: IDX_4d1c863a1e6a72f53df78b11a1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4d1c863a1e6a72f53df78b11a1" ON public.students USING btree (student_no);


--
-- Name: IDX_52173ac166366e558b177a7bd8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_52173ac166366e558b177a7bd8" ON public.transactions USING btree (provider);


--
-- Name: IDX_53fd61a4c83318ed2e30c11bdb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_53fd61a4c83318ed2e30c11bdb" ON public.cbt_schedules USING btree (cbt_center_id);


--
-- Name: IDX_54dca6b0cb9cd5be3a5851cd3f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_54dca6b0cb9cd5be3a5851cd3f" ON public.licenses USING btree (status);


--
-- Name: IDX_58271953a12e51dd9c53a6617e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_58271953a12e51dd9c53a6617e" ON public.driving_school_applications USING btree (reference);


--
-- Name: IDX_585fcf00ea7fc4b22d96faebc1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_585fcf00ea7fc4b22d96faebc1" ON public.otps USING btree (issued_at);


--
-- Name: IDX_59519987359fa30e63ee80460e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_59519987359fa30e63ee80460e" ON public.inspections USING btree (driving_school_id);


--
-- Name: IDX_595bdb1ab6c0a050343a9a3b1a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_595bdb1ab6c0a050343a9a3b1a" ON public.licenses USING btree (old_license_no);


--
-- Name: IDX_598eec97e5df3dc851d889162f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_598eec97e5df3dc851d889162f" ON public.api_clients USING btree (client_phone);


--
-- Name: IDX_5de5046750220bad9f050139fe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5de5046750220bad9f050139fe" ON public.permits USING btree (print_status);


--
-- Name: IDX_63cb2f2bd860fe335b2c59c761; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_63cb2f2bd860fe335b2c59c761" ON public.inspections USING btree (status);


--
-- Name: IDX_64e2fde218ea407c0db7c63c81; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_64e2fde218ea407c0db7c63c81" ON public.pre_registrations USING btree (driving_school_id);


--
-- Name: IDX_66cbad56e13eda8b4202652cf8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_66cbad56e13eda8b4202652cf8" ON public.transactions USING btree (email);


--
-- Name: IDX_68d97587fe1c0173193184f43a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_68d97587fe1c0173193184f43a" ON public.permits USING btree (gender_id);


--
-- Name: IDX_69379e1c1139fee3e7fa6339d9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_69379e1c1139fee3e7fa6339d9" ON public.users USING btree (change_password_next_login);


--
-- Name: IDX_698754e69f6b9bb4144a833031; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_698754e69f6b9bb4144a833031" ON public.transactions USING btree (item_id);


--
-- Name: IDX_6daff9926abbc21656aea9d408; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6daff9926abbc21656aea9d408" ON public.driving_schools USING btree (is_active);


--
-- Name: IDX_71f4fb56867b9f86710d18e76d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_71f4fb56867b9f86710d18e76d" ON public.driving_schools USING btree (state_id);


--
-- Name: IDX_7299334a8d524c2fa1e9fdc1c1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_7299334a8d524c2fa1e9fdc1c1" ON public.pre_registrations USING btree (status);


--
-- Name: IDX_738bc2c5df76629e5c70b56dbc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_738bc2c5df76629e5c70b56dbc" ON public.transactions USING btree (refunded);


--
-- Name: IDX_74200836eda0117fc7810ea867; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_74200836eda0117fc7810ea867" ON public.driving_school_applications USING btree (driving_school_id);


--
-- Name: IDX_74c961468677297c6eb81d10ef; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_74c961468677297c6eb81d10ef" ON public.driving_school_applications USING btree (status);


--
-- Name: IDX_769d5f1d1f2d427714d7a759dd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_769d5f1d1f2d427714d7a759dd" ON public.driving_school_applications USING btree (nin);


--
-- Name: IDX_77ad9ce55ee6c38c0f0a4c3bc0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_77ad9ce55ee6c38c0f0a4c3bc0" ON public.api_clients USING btree (client_email);


--
-- Name: IDX_7899f7e68ab395cf3da470aa9a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_7899f7e68ab395cf3da470aa9a" ON public.licenses USING btree (pre_registration_id);


--
-- Name: IDX_7d2e6acc1b1a0a78adab9a8e00; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_7d2e6acc1b1a0a78adab9a8e00" ON public.cbt_schedules USING btree (lga_id);


--
-- Name: IDX_7d30fbaff9bf4cb95a2989a5a9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_7d30fbaff9bf4cb95a2989a5a9" ON public.permits USING btree (lga_id);


--
-- Name: IDX_7e23a64155b2163b98ae1b80f7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_7e23a64155b2163b98ae1b80f7" ON public.pre_registrations USING btree (application_no);


--
-- Name: IDX_80d8e735bcb51129139bc80cd5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_80d8e735bcb51129139bc80cd5" ON public.pre_registrations USING btree (student_id);


--
-- Name: IDX_810775683ff144d228ebbc61d0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_810775683ff144d228ebbc61d0" ON public.licenses USING btree (years);


--
-- Name: IDX_83eab408ca724bd332466e1b2e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_83eab408ca724bd332466e1b2e" ON public.cbt_schedules USING btree ("time");


--
-- Name: IDX_84e94df1202688a9298cbc1b83; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_84e94df1202688a9298cbc1b83" ON public.students USING btree (graduated);


--
-- Name: IDX_88e9d889f0e8b7ebc35589f607; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_88e9d889f0e8b7ebc35589f607" ON public.driving_school_applications USING btree (phone);


--
-- Name: IDX_89d78c1bef4469f73ca8a4441e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_89d78c1bef4469f73ca8a4441e" ON public.licenses USING btree (approval_level);


--
-- Name: IDX_8c4b47688c2810d2539e580d67; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8c4b47688c2810d2539e580d67" ON public.otps USING btree (is_used);


--
-- Name: IDX_8e26b02b45637e9ae2bbb4cac7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8e26b02b45637e9ae2bbb4cac7" ON public.users USING btree (driving_school_id);


--
-- Name: IDX_9989645a23af127ea2b58b3c3f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9989645a23af127ea2b58b3c3f" ON public.cbt_schedules USING btree (date);


--
-- Name: IDX_99a914de56a0cc4b3adfeac671; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_99a914de56a0cc4b3adfeac671" ON public.training_durations USING btree (duration);


--
-- Name: IDX_9bd09e59708ea02bb49081961c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9bd09e59708ea02bb49081961c" ON public.otps USING btree (email);


--
-- Name: IDX_9d981a234d4a345669b83ee144; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9d981a234d4a345669b83ee144" ON public.driving_schools USING btree (identifier);


--
-- Name: IDX_a336a733fd27ee165aa0cae8b5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a336a733fd27ee165aa0cae8b5" ON public.email_notifications USING btree ("to");


--
-- Name: IDX_a3670a9ecaff524fb2c1c1c21b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a3670a9ecaff524fb2c1c1c21b" ON public.licenses USING btree (license_no);


--
-- Name: IDX_a45aff3ddac19b69bb58aac01d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a45aff3ddac19b69bb58aac01d" ON public.permits USING btree (years);


--
-- Name: IDX_a5277a36c8053d2a688e0426b2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a5277a36c8053d2a688e0426b2" ON public.inspections USING btree (year);


--
-- Name: IDX_a7e16cc8a5e1c4a804d32f1a83; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a7e16cc8a5e1c4a804d32f1a83" ON public.pre_registrations USING btree (reference);


--
-- Name: IDX_ab092c1cb567c1ed98be48ddbc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ab092c1cb567c1ed98be48ddbc" ON public.pre_registrations USING btree (cbt_center_id);


--
-- Name: IDX_adc5364867f44d6f6f04ee9700; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_adc5364867f44d6f6f04ee9700" ON public.licenses USING btree (phone);


--
-- Name: IDX_af5c9c8df2a6c7fe71cf61d82b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_af5c9c8df2a6c7fe71cf61d82b" ON public.permits USING btree (phone);


--
-- Name: IDX_b3175506c8023f09767b258cdc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b3175506c8023f09767b258cdc" ON public.driving_school_instructors USING btree (is_active);


--
-- Name: IDX_b3bc610967da06de7b140494c7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b3bc610967da06de7b140494c7" ON public.students USING btree (application_id);


--
-- Name: IDX_b4111d036a4b1cf9acf0784d67; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b4111d036a4b1cf9acf0784d67" ON public.driving_school_applications USING btree (state_of_origin_id);


--
-- Name: IDX_b4139c5548076251de1cd07250; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b4139c5548076251de1cd07250" ON public.licenses USING btree (is_active);


--
-- Name: IDX_b49502231f0cb2bc451fcf552d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b49502231f0cb2bc451fcf552d" ON public.transactions USING btree (item_type);


--
-- Name: IDX_b6050900ae84e59d45b833aaf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b6050900ae84e59d45b833aaf9" ON public.driving_schools USING btree (reference);


--
-- Name: IDX_b7974e5a0602723091002ad682; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b7974e5a0602723091002ad682" ON public.licenses USING btree (request_type);


--
-- Name: IDX_b9c95c7e37499f9963da1c8d73; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b9c95c7e37499f9963da1c8d73" ON public.students USING btree (is_active);


--
-- Name: IDX_bb9f7eda802df75819efc0427c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bb9f7eda802df75819efc0427c" ON public.driving_school_applications USING btree (training_duration_id);


--
-- Name: IDX_becff8934b4ea975411ac1b3d6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_becff8934b4ea975411ac1b3d6" ON public.pre_registrations USING btree (years);


--
-- Name: IDX_c2a432cf1b14dce9ae2d91e0d4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c2a432cf1b14dce9ae2d91e0d4" ON public.permits USING btree (request_type);


--
-- Name: IDX_c37da3607f7214c3dda1803d09; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c37da3607f7214c3dda1803d09" ON public.devices USING btree (status);


--
-- Name: IDX_c3dd9222a377f7cdfc954fcf0c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c3dd9222a377f7cdfc954fcf0c" ON public.transactions USING btree (currency);


--
-- Name: IDX_c3e05255537c56aab43d559a43; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c3e05255537c56aab43d559a43" ON public.inspections USING btree (month);


--
-- Name: IDX_c5c1d3d9507c3d45acc94f3cbd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c5c1d3d9507c3d45acc94f3cbd" ON public.permits USING btree (transaction_id);


--
-- Name: IDX_c71086de9518a62295e8f84cb0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c71086de9518a62295e8f84cb0" ON public.driving_test_centers USING btree (identifier);


--
-- Name: IDX_c98b4fa695d8b658838cb24fd3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c98b4fa695d8b658838cb24fd3" ON public.licenses USING btree (gender_id);


--
-- Name: IDX_cc54d0c933605258bb1f9d8201; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cc54d0c933605258bb1f9d8201" ON public.permits USING btree (station_id);


--
-- Name: IDX_cedf67dc12b858b1d88a0dd7f8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cedf67dc12b858b1d88a0dd7f8" ON public.transactions USING btree (used);


--
-- Name: IDX_d09ea94722bc2420d78350fcdc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d09ea94722bc2420d78350fcdc" ON public.students USING btree (driving_school_id);


--
-- Name: IDX_d253b8e0335599f451904a3041; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d253b8e0335599f451904a3041" ON public.licenses USING btree (station_id);


--
-- Name: IDX_d262d3f68e4a21ea50c7f0b5c9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d262d3f68e4a21ea50c7f0b5c9" ON public.questions USING btree (category);


--
-- Name: IDX_d4fa8fec5cf093d591840e69ef; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d4fa8fec5cf093d591840e69ef" ON public.driving_schools USING btree (phone);


--
-- Name: IDX_d6454872d5feb5295a40b4636c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d6454872d5feb5295a40b4636c" ON public.permits USING btree (permit_no);


--
-- Name: IDX_d8b7d8f7012a45170822417c4d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d8b7d8f7012a45170822417c4d" ON public.users USING btree (lga_id);


--
-- Name: IDX_dc625c02d65641ee6e0b3d7e70; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dc625c02d65641ee6e0b3d7e70" ON public.driving_schools USING btree (lga_id);


--
-- Name: IDX_dd85cc865e0c3d5d4be095d3f3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dd85cc865e0c3d5d4be095d3f3" ON public.transactions USING btree (reference);


--
-- Name: IDX_dea21a95c06cf8bce28a6f8e36; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dea21a95c06cf8bce28a6f8e36" ON public.driving_school_applications USING btree (application_no);


--
-- Name: IDX_e1d07be29a0897bab89f89a3f2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e1d07be29a0897bab89f89a3f2" ON public.licenses USING btree (email);


--
-- Name: IDX_e53452666d5488b57f6ace0828; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e53452666d5488b57f6ace0828" ON public.driving_schools USING btree (name);


--
-- Name: IDX_e589d18ac4320f3f83fc789142; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e589d18ac4320f3f83fc789142" ON public.users USING btree (state_id);


--
-- Name: IDX_e8a8d25966dd60c0d05ed76ff2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e8a8d25966dd60c0d05ed76ff2" ON public.pre_registrations USING btree (cbt_schedule_id);


--
-- Name: IDX_e8aa2cf0d04c127a9ba896ad90; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e8aa2cf0d04c127a9ba896ad90" ON public.api_clients USING btree (client_identity);


--
-- Name: IDX_e9aabd0e293db94f2419799d83; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e9aabd0e293db94f2419799d83" ON public.licenses USING btree (license_class_id);


--
-- Name: IDX_e9acc6efa76de013e8c1553ed2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e9acc6efa76de013e8c1553ed2" ON public.transactions USING btree (user_id);


--
-- Name: IDX_eb565013d76b9b3f324df8dfe1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_eb565013d76b9b3f324df8dfe1" ON public.training_durations USING btree (driving_school_id);


--
-- Name: IDX_ed27828a6ec28be0838c6e7f96; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ed27828a6ec28be0838c6e7f96" ON public.transactions USING btree (channel);


--
-- Name: IDX_ed8d9979a8295afe3a06fb5d82; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ed8d9979a8295afe3a06fb5d82" ON public.audit_trails USING btree (user_id);


--
-- Name: IDX_efc5d16864b8de99516576397d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_efc5d16864b8de99516576397d" ON public.api_clients USING btree (is_active);


--
-- Name: IDX_f283bf519865e81957523dfac8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f283bf519865e81957523dfac8" ON public.permits USING btree (old_permit_no);


--
-- Name: IDX_f686c353be051e0742736f4da8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f686c353be051e0742736f4da8" ON public.permits USING btree (reference);


--
-- Name: pre_registrations FK_0a0349feae303fbaba3286ded5d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations
    ADD CONSTRAINT "FK_0a0349feae303fbaba3286ded5d" FOREIGN KEY (driving_test_center_id) REFERENCES public.driving_test_centers(id);


--
-- Name: api_clients FK_0e496b159dff87d9dab2a41a051; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_clients
    ADD CONSTRAINT "FK_0e496b159dff87d9dab2a41a051" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: applicant_files FK_1334609961c28d59a274db574de; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicant_files
    ADD CONSTRAINT "FK_1334609961c28d59a274db574de" FOREIGN KEY (driving_school_application_id) REFERENCES public.driving_school_applications(id);


--
-- Name: driving_school_applications FK_139003c73dd6721f8b6d913ee5a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_applications
    ADD CONSTRAINT "FK_139003c73dd6721f8b6d913ee5a" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: license_files FK_13d012c5e1babb135d93f60ad21; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_files
    ADD CONSTRAINT "FK_13d012c5e1babb135d93f60ad21" FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: inspections FK_1db7f098c06a733dd8d444fe7bc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT "FK_1db7f098c06a733dd8d444fe7bc" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: nodes FK_21b235c62db6b21dade41a022ba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT "FK_21b235c62db6b21dade41a022ba" FOREIGN KEY (activated_by) REFERENCES public.users(id);


--
-- Name: driving_test_schedules FK_2318bbd77abc42c9ff5bd6c1bcc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_test_schedules
    ADD CONSTRAINT "FK_2318bbd77abc42c9ff5bd6c1bcc" FOREIGN KEY (pre_registration_id) REFERENCES public.pre_registrations(id);


--
-- Name: driving_schools FK_31271ae1f75b634d48ea00810da; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_schools
    ADD CONSTRAINT "FK_31271ae1f75b634d48ea00810da" FOREIGN KEY (officer_id) REFERENCES public.users(id);


--
-- Name: driving_school_instructors FK_31a33ddc375a0691160255311c4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_instructors
    ADD CONSTRAINT "FK_31a33ddc375a0691160255311c4" FOREIGN KEY (driving_school_id) REFERENCES public.driving_schools(id);


--
-- Name: driving_schools FK_347dd9027413c67d974139362e1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_schools
    ADD CONSTRAINT "FK_347dd9027413c67d974139362e1" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: license_files FK_38fe1813d7e3354f8ab2cb60bfb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_files
    ADD CONSTRAINT "FK_38fe1813d7e3354f8ab2cb60bfb" FOREIGN KEY (license_id) REFERENCES public.licenses(id);


--
-- Name: driving_school_application_queries FK_3d4e8a26e609d8780126dda6381; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_application_queries
    ADD CONSTRAINT "FK_3d4e8a26e609d8780126dda6381" FOREIGN KEY (driving_school_id) REFERENCES public.driving_schools(id);


--
-- Name: cbt_schedules FK_3e7052c831723ef8d883dfa763b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cbt_schedules
    ADD CONSTRAINT "FK_3e7052c831723ef8d883dfa763b" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: cbt_schedules FK_4119af6ebf2d26370ab9115ecf9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cbt_schedules
    ADD CONSTRAINT "FK_4119af6ebf2d26370ab9115ecf9" FOREIGN KEY (pre_registration_id) REFERENCES public.pre_registrations(id);


--
-- Name: permits FK_433cfbb801e2b7bc7ccd3c1679f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permits
    ADD CONSTRAINT "FK_433cfbb801e2b7bc7ccd3c1679f" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: applicant_files FK_5332c04ab7a08d156f9c77a8994; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicant_files
    ADD CONSTRAINT "FK_5332c04ab7a08d156f9c77a8994" FOREIGN KEY (file_id) REFERENCES public.files(id);


--
-- Name: cbt_schedules FK_53fd61a4c83318ed2e30c11bdba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cbt_schedules
    ADD CONSTRAINT "FK_53fd61a4c83318ed2e30c11bdba" FOREIGN KEY (cbt_center_id) REFERENCES public.cbt_centers(id);


--
-- Name: driving_test_schedules FK_551054c5d8e35080fa5f0676184; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_test_schedules
    ADD CONSTRAINT "FK_551054c5d8e35080fa5f0676184" FOREIGN KEY (assessed_by) REFERENCES public.users(id);


--
-- Name: inspections FK_59519987359fa30e63ee80460e8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT "FK_59519987359fa30e63ee80460e8" FOREIGN KEY (driving_school_id) REFERENCES public.driving_schools(id);


--
-- Name: pre_registrations FK_64e2fde218ea407c0db7c63c816; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations
    ADD CONSTRAINT "FK_64e2fde218ea407c0db7c63c816" FOREIGN KEY (driving_school_id) REFERENCES public.driving_schools(id);


--
-- Name: driving_school_instructors FK_67d6edc953854a17d978e56a2a8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_instructors
    ADD CONSTRAINT "FK_67d6edc953854a17d978e56a2a8" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: pre_registrations FK_689b5e66ca08d76053a24ac422f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations
    ADD CONSTRAINT "FK_689b5e66ca08d76053a24ac422f" FOREIGN KEY (driving_test_schedule_id) REFERENCES public.driving_test_schedules(id);


--
-- Name: permits FK_6e9b84bed985ce5be8537f82187; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permits
    ADD CONSTRAINT "FK_6e9b84bed985ce5be8537f82187" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: users FK_6f59664a52537fbed69e2146610; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_6f59664a52537fbed69e2146610" FOREIGN KEY (node_id) REFERENCES public.nodes(id);


--
-- Name: driving_school_applications FK_74200836eda0117fc7810ea867f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_applications
    ADD CONSTRAINT "FK_74200836eda0117fc7810ea867f" FOREIGN KEY (driving_school_id) REFERENCES public.driving_schools(id);


--
-- Name: cbt_schedules FK_7727eae87cf349c2c09cdd28703; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cbt_schedules
    ADD CONSTRAINT "FK_7727eae87cf349c2c09cdd28703" FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: licenses FK_7899f7e68ab395cf3da470aa9a5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT "FK_7899f7e68ab395cf3da470aa9a5" FOREIGN KEY (pre_registration_id) REFERENCES public.pre_registrations(id);


--
-- Name: inspection_questions FK_79533ab45a66837ee4f688ca956; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_questions
    ADD CONSTRAINT "FK_79533ab45a66837ee4f688ca956" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: questions FK_7d0fdceddfeebcc65d61b2f4c70; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "FK_7d0fdceddfeebcc65d61b2f4c70" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: pre_registrations FK_80d8e735bcb51129139bc80cd56; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations
    ADD CONSTRAINT "FK_80d8e735bcb51129139bc80cd56" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: users FK_8e26b02b45637e9ae2bbb4cac78; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_8e26b02b45637e9ae2bbb4cac78" FOREIGN KEY (driving_school_id) REFERENCES public.driving_schools(id);


--
-- Name: driving_test_schedules FK_92ae409ad5c69395b110e63c9c6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_test_schedules
    ADD CONSTRAINT "FK_92ae409ad5c69395b110e63c9c6" FOREIGN KEY (driving_test_center_id) REFERENCES public.driving_test_centers(id);


--
-- Name: pre_registrations FK_992da9aea8d36c263f13ae69326; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations
    ADD CONSTRAINT "FK_992da9aea8d36c263f13ae69326" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: cbt_schedules FK_992f2ac79b69765b6533cdb1bad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cbt_schedules
    ADD CONSTRAINT "FK_992f2ac79b69765b6533cdb1bad" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: licenses FK_a24d177962b0c9ff1fa4ba0faa9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT "FK_a24d177962b0c9ff1fa4ba0faa9" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: pre_registrations FK_ab092c1cb567c1ed98be48ddbc2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations
    ADD CONSTRAINT "FK_ab092c1cb567c1ed98be48ddbc2" FOREIGN KEY (cbt_center_id) REFERENCES public.cbt_centers(id);


--
-- Name: students FK_acb0e90f48f22601cb296422ec6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_acb0e90f48f22601cb296422ec6" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: students FK_b3bc610967da06de7b140494c7b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_b3bc610967da06de7b140494c7b" FOREIGN KEY (application_id) REFERENCES public.driving_school_applications(id);


--
-- Name: driving_school_application_queries FK_b51ddeda830018db5ba3bb8e2b4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_application_queries
    ADD CONSTRAINT "FK_b51ddeda830018db5ba3bb8e2b4" FOREIGN KEY (queried_by_id) REFERENCES public.users(id);


--
-- Name: training_durations FK_ba82422340781e4a801b24aa0e8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_durations
    ADD CONSTRAINT "FK_ba82422340781e4a801b24aa0e8" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: driving_school_applications FK_bb9f7eda802df75819efc0427c2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_school_applications
    ADD CONSTRAINT "FK_bb9f7eda802df75819efc0427c2" FOREIGN KEY (training_duration_id) REFERENCES public.training_durations(id);


--
-- Name: permits FK_c5c1d3d9507c3d45acc94f3cbd5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permits
    ADD CONSTRAINT "FK_c5c1d3d9507c3d45acc94f3cbd5" FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: licenses FK_c95c319afe6ee4bdc244123f8a5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT "FK_c95c319afe6ee4bdc244123f8a5" FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: license_files FK_cc304c969c2937d80586751c3b6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_files
    ADD CONSTRAINT "FK_cc304c969c2937d80586751c3b6" FOREIGN KEY (pre_registration_id) REFERENCES public.pre_registrations(id);


--
-- Name: driving_test_schedules FK_d04156f749656f1206fe5428c10; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_test_schedules
    ADD CONSTRAINT "FK_d04156f749656f1206fe5428c10" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: students FK_d09ea94722bc2420d78350fcdc0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_d09ea94722bc2420d78350fcdc0" FOREIGN KEY (driving_school_id) REFERENCES public.driving_schools(id);


--
-- Name: cbt_schedules FK_d6ef6a357ce3b9c785347bd4502; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cbt_schedules
    ADD CONSTRAINT "FK_d6ef6a357ce3b9c785347bd4502" FOREIGN KEY (assessed_by) REFERENCES public.users(id);


--
-- Name: driving_test_schedules FK_d94d7f20569090a7293853b0ddc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driving_test_schedules
    ADD CONSTRAINT "FK_d94d7f20569090a7293853b0ddc" FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: pre_registrations FK_e8a8d25966dd60c0d05ed76ff22; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_registrations
    ADD CONSTRAINT "FK_e8a8d25966dd60c0d05ed76ff22" FOREIGN KEY (cbt_schedule_id) REFERENCES public.cbt_schedules(id);


--
-- Name: training_durations FK_eb565013d76b9b3f324df8dfe12; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_durations
    ADD CONSTRAINT "FK_eb565013d76b9b3f324df8dfe12" FOREIGN KEY (driving_school_id) REFERENCES public.driving_schools(id);


--
-- Name: audit_trails FK_ed8d9979a8295afe3a06fb5d82a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_trails
    ADD CONSTRAINT "FK_ed8d9979a8295afe3a06fb5d82a" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: applicant_files FK_fce2f2082c7f4b0217840f15f36; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicant_files
    ADD CONSTRAINT "FK_fce2f2082c7f4b0217840f15f36" FOREIGN KEY (driving_school_id) REFERENCES public.driving_schools(id);


--
-- PostgreSQL database dump complete
--

