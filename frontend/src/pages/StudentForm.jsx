import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { emailLooksWrong, required, useWizard } from '../lib/wizard'
import { ConfirmMark, Cover } from '../components/Cover'
import { LogoLockup } from '../components/Logo'
import Welcome from '../components/Welcome'
import PersonaIcon from '../components/PersonaIcon'
import {
  ProgressTrack, Reflection, ReviewGrid, SheetFooter, SheetHero, StepHead, TopBar, VisualFrame,
} from '../components/FormShell'
import {
  Alert, ChoiceGrid, Combobox, Field, FieldError, Select, Spinner, TextInput,
} from '../components/ui'

const STEPS = ['About You', 'Academic Journey', 'Your Future', 'Your India', 'Review']
const OTHER = 'Others (Please specify)'

const INITIAL = {
  name: '', email: '', department: '', location: '',
  level: '', programme: '', year: '',
  vision_self: '', vision_india: '',
}

const SELF_PROMPTS = [
  { label: 'Leadership', text: 'I want to become a leader in' },
  { label: 'Entrepreneurship', text: 'I want to build a business or startup that' },
  { label: 'Innovation', text: 'I want to create innovative solutions for' },
  { label: 'Research', text: 'I want to contribute through research in' },
  { label: 'Sustainability', text: 'I want to build a sustainable future by' },
]

const INDIA_PROMPTS = [
  { label: 'Education', text: 'I imagine an India where education is' },
  { label: 'Technology', text: 'I imagine India becoming a technology leader through' },
  { label: 'Jobs & Economy', text: 'I want India to create more jobs and opportunities by' },
  { label: 'Green Future', text: 'I want India to become more sustainable by' },
  { label: 'Inclusion', text: 'I want every community to have equal opportunities through' },
]

const validators = {
  1: (d) => {
    const e = {}
    if (required(d.name)) e.name = 'Please enter your name.'
    if (emailLooksWrong(d.email)) e.email = 'That email address does not look complete.'
    if (required(d.department)) e.department = 'Please select your department.'
    if (required(d.location)) e.location = 'Please select your location.'
    return e
  },
  2: (d) => {
    const e = {}
    if (required(d.level)) e.level = 'Please choose your level of study.'
    if (required(d.programme)) e.programme = 'Please enter your programme.'
    if (required(d.year)) e.year = 'Please select your year / semester.'
    return e
  },
  3: (d) => (required(d.vision_self) ? { vision_self: 'Please share your vision.' } : {}),
  4: (d) => (required(d.vision_india) ? { vision_india: 'Please share your vision for India.' } : {}),
}

export default function StudentForm() {
  const [started, setStarted] = useState(false)
  const [meta, setMeta] = useState(null)
  const [metaError, setMetaError] = useState('')

  useEffect(() => {
    api.meta().then(setMeta).catch((err) => setMetaError(err.message))
  }, [])

  const w = useWizard({
    draftKey: 'dfe_student_draft_v2',
    initial: INITIAL,
    validators,
    stepCount: 5,
    submit: (d) => api.submitStudent({ ...d, email: d.email.trim() || null }),
  })

  const years = useMemo(() => meta?.years_by_level?.[w.data.level] || [], [meta, w.data.level])

  // Someone returning to a saved draft goes straight back to their answers.
  useEffect(() => {
    if (w.restored) setStarted(true)
  }, [w.restored])

  if (w.status === 'done') return <Confirmation data={w.data} onRestart={w.reset} />

  if (!started) {
    return (
      <Welcome
        audience="student"
        subtitle="Office of Academics · Student Dialogue"
        scene="students"
        quote="Your ideas matter. Take a few minutes to imagine the person you want to become — and the India you want to help build."
        cta="Begin Your Journey"
        footnote="A student reflection initiative by the Office of Academics"
        onBegin={() => setStarted(true)}
      />
    )
  }

  return (
    <div className="sheet">
      <a className="skip-link" href="#form-main">Skip to the form</a>

      <TopBar savedAt={w.savedAt} subtitle="Office of Academics · Student Dialogue" />

      <div className="form-shell" id="form-main">
        <SheetHero
          tag="Student Dialogue · 5 steps"
          title="Dialogue with"
          highlight="Future"
          tail="Entrepreneurs"
        >
          Your ideas matter. Take a few minutes to imagine the person you want to become — and the
          India you want to help build. Your draft saves as you type.
        </SheetHero>
        <ProgressTrack steps={STEPS} current={w.step} furthest={w.furthest} onJump={w.jump} />

        {metaError ? <Alert kind="error" title="Reference lists unavailable.">{metaError}</Alert> : null}

        {w.restored ? (
          <Alert kind="info" title="We restored your saved draft.">
            <button type="button" className="review-edit" onClick={w.discardDraft}>
              Start fresh instead
            </button>
          </Alert>
        ) : null}

        {w.formError ? <Alert kind="error">{w.formError}</Alert> : null}

        {w.step === 1 ? (
          <section className="step-panel">
            <StepHead
              kicker="01 · About You"
              heading="Let's start with you."
              note="Every journey begins with knowing where you are. Tell us a little about yourself so your reflection can be understood in context."
            />
            <VisualFrame scene="identity" caption="Every journey begins with knowing where you are." />

            <Field label="Your name" htmlFor="f-name" error={w.errors.name}>
              <TextInput
                id="f-name" autoComplete="name" placeholder="Enter your full name"
                value={w.data.name} error={w.errors.name}
                onChange={(e) => w.set({ name: e.target.value })}
              />
            </Field>

            <Field
              label="Email" optional htmlFor="f-email" error={w.errors.email}
              hint="Only used if the Office of Academics needs to reach you about this initiative."
            >
              <TextInput
                id="f-email" type="email" autoComplete="email" placeholder="you@example.com"
                value={w.data.email} error={w.errors.email}
                onChange={(e) => w.set({ email: e.target.value })}
              />
            </Field>

            <Field
              label="Department" htmlFor="f-department" error={w.errors.department}
              hint="Start typing to search, or choose “Others” to enter your own."
            >
              <Combobox
                id="f-department" options={meta?.departments || []} otherLabel={OTHER}
                value={w.data.department} error={w.errors.department}
                placeholder="Start typing to search your department…"
                onChange={(v) => w.set({ department: v })}
              />
            </Field>

            <Field label="Campus / Location" htmlFor="f-location" error={w.errors.location}>
              <Select
                id="f-location" value={w.data.location} error={w.errors.location}
                onChange={(e) => w.set({ location: e.target.value })}
              >
                <option value="">Select location</option>
                {(meta?.locations || ['Bangalore', 'Kochi']).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </Select>
            </Field>
          </section>
        ) : null}

        {w.step === 2 ? (
          <section className="step-panel">
            <StepHead
              kicker="02 · Academic Journey"
              heading="Tell us where you are in your journey."
              note="Your current chapter is part of the story you are writing."
            />
            <VisualFrame scene="journey" caption="Your current chapter is part of the story you are writing." />

            <div className="field-group" data-field="level">
              <div className="field-label">Level of study</div>
              <ChoiceGrid
                name="Level of study"
                options={(meta?.levels || []).map((l) => ({ value: l.value, label: l.label, hint: l.hint }))}
                value={w.data.level}
                onChange={(v) => w.set({ level: v, year: '' })}
              />
              <FieldError>{w.errors.level}</FieldError>
            </div>

            <div className="grid-2">
              <Field label="Programme" htmlFor="f-programme" error={w.errors.programme}>
                <TextInput
                  id="f-programme" placeholder="e.g. B.Tech Computer Science"
                  value={w.data.programme} error={w.errors.programme}
                  onChange={(e) => w.set({ programme: e.target.value })}
                />
              </Field>
              <Field
                label="Year / Semester" htmlFor="f-year" error={w.errors.year}
                hint={w.data.level ? undefined : 'Choose a level of study first.'}
              >
                <Select
                  id="f-year" value={w.data.year} error={w.errors.year} disabled={!w.data.level}
                  onChange={(e) => w.set({ year: e.target.value })}
                >
                  <option value="">{w.data.level ? 'Select year / semester' : '—'}</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </Select>
              </Field>
            </div>
          </section>
        ) : null}

        {w.step === 3 ? (
          <section className="step-panel">
            <StepHead
              kicker="03 · Your Future"
              heading="Imagine the life you want to create."
              note="Think beyond your next exam. Where do you see yourself going?"
            />
            <VisualFrame scene="horizon" caption="Think beyond your next exam. Where do you see yourself going?" />

            <div className="field-group" data-field="vision_self">
              <div className="field-label">My Vision for My Future</div>
              <Reflection
                id="f-vision_self" value={w.data.vision_self} error={w.errors.vision_self}
                onChange={(v) => w.set({ vision_self: v })} prompts={SELF_PROMPTS}
                placeholder="What do you want to become, create, explore or contribute? Write freely — there is no right answer."
              />
              <FieldError id="f-vision_self-error">{w.errors.vision_self}</FieldError>
            </div>
          </section>
        ) : null}

        {w.step === 4 ? (
          <section className="step-panel">
            <StepHead
              kicker="04 · Your India"
              heading="Now look beyond yourself."
              note="If your generation could shape India, what would you change?"
            />
            <VisualFrame scene="nation" caption="If your generation could shape India, what would you change?" />

            <div className="field-group" data-field="vision_india">
              <div className="field-label">My Vision for India&rsquo;s Future</div>
              <Reflection
                id="f-vision_india" value={w.data.vision_india} error={w.errors.vision_india}
                onChange={(v) => w.set({ vision_india: v })} prompts={INDIA_PROMPTS}
                placeholder="What kind of India do you want to live in — and what role could your generation play in building it?"
              />
              <FieldError id="f-vision_india-error">{w.errors.vision_india}</FieldError>
            </div>
          </section>
        ) : null}

        {w.step === 5 ? (
          <section className="step-panel">
            <StepHead kicker="05 · Review" heading="One last look at your journey." />
            <ReviewGrid
              onEdit={w.jump}
              rows={[
                { key: 'Name', value: w.data.name, step: 1 },
                { key: 'Email', value: w.data.email, step: 1 },
                { key: 'Department', value: w.data.department, step: 1 },
                { key: 'Location', value: w.data.location, step: 1 },
                { key: 'Level', value: w.data.level, step: 2 },
                { key: 'Programme', value: w.data.programme, step: 2 },
                { key: 'Year / Semester', value: w.data.year, step: 2 },
                { key: 'My Vision for My Future', value: w.data.vision_self, step: 3, long: true },
                { key: "My Vision for India's Future", value: w.data.vision_india, step: 4, long: true },
              ]}
            />
          </section>
        ) : null}

        <div className="step-nav">
          <button
            type="button" className="btn btn-ghost" onClick={w.back}
            style={{ visibility: w.step === 1 ? 'hidden' : 'visible' }}
          >
            ← Back
          </button>
          {w.step === 5 ? (
            <button type="button" className="btn btn-primary" onClick={w.send} disabled={w.status === 'saving'}>
              {w.status === 'saving' ? <><Spinner label="Submitting" /> Submitting…</> : 'Submit Response'}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={w.next}>Next →</button>
          )}
        </div>

        <SheetFooter />
      </div>
    </div>
  )
}

/* A light, encouraging persona derived from the student's own words. */
const PERSONAS = [
  [/entrepreneur|startup|start-up|founder|business|venture/, 'Entrepreneur in the Making',
    'Entrepreneurial Vision', 'venture', 'entrepreneur',
    'You see opportunity in ideas — and ideas as something that can become real ventures.'],
  [/sustainab|environment|green future|eco|climate|renewable|nature|pollution|waste/, 'Green Future Creator',
    'Sustainability Champion', 'leaf', 'green',
    'Your vision connects progress with responsibility for the planet and future generations.'],
  [/research|phd|doctor|scientific|knowledge|publication/, 'Knowledge Creator',
    'Research & Discovery', 'research', 'purple',
    'You are driven to discover, question and create knowledge that can move society forward.'],
  [/innov|technology|artificial intelligence|ai|digital|machine learning|robot/, 'Innovation Catalyst',
    'Innovation & Technology', 'spark', 'teal',
    'You imagine a future shaped by new ideas, technology and practical solutions.'],
  [/leadership|leader|manage|decision|influence/, 'Future Leader',
    'Leadership & Impact', 'lead', 'gold',
    'You see yourself taking responsibility, bringing people together and creating direction.'],
  [/social impact|society|community|empower|equality|inclusion|women|youth/, 'Social Impact Changemaker',
    'Social Impact', 'people', 'purple',
    'Your vision puts people, opportunity and positive social change at the centre.'],
  [/global|international|world|abroad/, 'Global Citizen',
    'Global Perspective', 'globe', 'blue',
    'You are thinking beyond borders and imagining a future connected to the world.'],
  [/education|teaching|learning|skill development|students/, 'Learning Transformer',
    'Education & Learning', 'learn', 'blue',
    'You see education and continuous learning as powerful drivers of personal and national transformation.'],
]

function persona(text) {
  const t = String(text || '').toLowerCase()
  const match = PERSONAS.find(([re]) => re.test(t))
  return match
    ? { title: match[1], tag: match[2], icon: match[3], cls: match[4], note: match[5] }
    : {
      title: 'Future Builder', tag: 'Visionary Student', icon: 'compass', cls: 'blue',
      note: 'You are imagining possibilities and thinking beyond the present.',
    }
}

function Confirmation({ data, onRestart }) {
  const p = persona(`${data.vision_self} ${data.vision_india}`)
  return (
    <Cover variant="back" audience="student" rings>
      <LogoLockup subtitle="Office of Academics · Student Dialogue" variant="light" />
      <ConfirmMark />
      <h2 className="confirm-title">Your voice is recorded.</h2>
      <p className="confirm-sub">
        Thank you{data.name ? `, ${data.name.split(' ')[0]}` : ''}. Your ideas are now part of a larger
        picture of what students hope to build for themselves and for India.
      </p>

      <div className="avatar-stage">
        <div className={`avatar-card ${p.cls}`}>
          <div className="avatar-icon"><PersonaIcon name={p.icon} /></div>
          <div className="avatar-title">{p.title}</div>
          <div className="avatar-tag">{p.tag}</div>
          <div className="avatar-note">{p.note}</div>
        </div>
      </div>

      <div className="cover-links">
        <button className="btn-outline" type="button" onClick={onRestart}>Share Another Response</button>
        <Link className="btn-outline" to="/">Back to home</Link>
      </div>
    </Cover>
  )
}
