import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { emailLooksWrong, required, useWizard } from '../lib/wizard'
import { ConfirmMark, Cover } from '../components/Cover'
import { LogoLockup } from '../components/Logo'
import Welcome from '../components/Welcome'
import {
  ProgressTrack, Reflection, ReviewGrid, SheetFooter, SheetHero, StepHead, TopBar, VisualFrame,
} from '../components/FormShell'
import {
  Alert, Combobox, Field, FieldError, Select, Spinner, TextArea, TextInput,
} from '../components/ui'

const STEPS = [
  'Tell Us About You', 'Where Do You Teach?', 'The Future I See', 'The India I Hope to See', 'Review',
]
const OTHER = 'Others (Please specify)'

const INITIAL = {
  name: '', email: '', department: '', location: '',
  research_expertise: '', research_interests: '', research_focus: '', research_impact: '',
  engagements: [{ programme: '', semester: '', course_name: '' }],
  meeting_date: '', vision_self: '', vision_india: '',
}

const RESEARCH_FIELDS = [
  ['research_expertise', 'Research Expertise / Area of Specialisation',
    'Tell us about your primary areas of research expertise or academic specialisation…'],
  ['research_interests', 'Current Research Interests',
    'What emerging questions, themes or areas of inquiry are currently engaging your attention?'],
  ['research_focus', 'Your Research in Focus',
    'Briefly describe your current or significant research work, project or area of investigation…'],
  ['research_impact', 'From Research to Impact',
    'How do you see your research contributing to education, society, industry or the wider community?'],
]

const validators = {
  1: (d) => {
    const e = {}
    if (required(d.name)) e.name = 'Please share your name to continue.'
    if (emailLooksWrong(d.email)) e.email = 'That email address does not look complete.'
    if (required(d.department)) e.department = 'Please select your department from the list.'
    if (required(d.location)) e.location = 'Please select your location.'
    RESEARCH_FIELDS.forEach(([key, label]) => {
      if (required(d[key])) e[key] = `Please complete “${label}”.`
    })
    return e
  },
  2: (d) => {
    const e = {}
    const incomplete = d.engagements.some(
      (x) => required(x.programme) || required(x.semester) || required(x.course_name),
    )
    if (!d.engagements.length || incomplete) {
      e.engagements = 'Please add at least one academic engagement and complete all three fields.'
    }
    if (required(d.meeting_date)) e.meeting_date = 'Please choose the date of the meeting.'
    return e
  },
  3: (d) => (required(d.vision_self) ? { vision_self: 'Please share a few words on this before continuing.' } : {}),
  4: (d) => (required(d.vision_india) ? { vision_india: 'Please share a few words on this before continuing.' } : {}),
}

export default function FacultyForm() {
  const [started, setStarted] = useState(false)
  const [meta, setMeta] = useState(null)
  const [metaError, setMetaError] = useState('')

  useEffect(() => {
    api.meta().then(setMeta).catch((err) => setMetaError(err.message))
  }, [])

  const w = useWizard({
    draftKey: 'dfe_faculty_draft_v2',
    initial: INITIAL,
    validators,
    stepCount: 5,
    submit: (d) => api.submitFaculty({ ...d, email: d.email.trim() || null }),
  })

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  // Someone returning to a saved draft goes straight back to their answers.
  useEffect(() => {
    if (w.restored) setStarted(true)
  }, [w.restored])

  if (w.status === 'done') {
    return (
      <Confirmation
        onRestart={w.reset}
        onStart={() => {
          w.reset()
          setStarted(false)
        }}
      />
    )
  }

  if (!started) {
    return (
      <Welcome
        audience="faculty"
        subtitle="Office of Academics · Faculty Dialogue"
        scene="faculty"
        quote="An opportunity to reflect on the future you envision — for yourself, for your learners, and for India."
        cta="Begin the Dialogue"
        footnote="A reflection initiative by the Office of Academics"
        onBegin={() => setStarted(true)}
      />
    )
  }

  return (
    <div className="sheet">
      <a className="skip-link" href="#form-main">Skip to the form</a>

      <TopBar savedAt={w.savedAt} subtitle="Office of Academics · Faculty Dialogue" />

      <div className="form-shell" id="form-main">
        <SheetHero
          tag="Faculty Dialogue · 5 steps"
          title="Dialogue with"
          highlight="Future"
          tail="Entrepreneurs"
        >
          An opportunity to reflect on the future you envision — for yourself, for your learners, and
          for India. Your draft saves as you type.
        </SheetHero>
        <ProgressTrack steps={STEPS} current={w.step} furthest={w.furthest} onJump={w.jump} />

        {metaError ? (
          <Alert kind="error" title="Reference lists unavailable.">
            {metaError} You can still type your department manually.
          </Alert>
        ) : null}

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
              kicker="Tell Us About You"
              heading="The ideas, questions and experiences that shape your academic journey."
              note="Every academic journey is shaped by what we explore, what we share and what continues to inspire us. Tell us a little about yourself and the areas of knowledge you are passionate about."
            />
            <VisualFrame scene="research" caption="The ideas and questions that shape your work." />

            <Field label="Name" htmlFor="f-name" error={w.errors.name}>
              <TextInput
                id="f-name" autoComplete="name" placeholder="Your full name"
                value={w.data.name} error={w.errors.name}
                onChange={(e) => w.set({ name: e.target.value })}
              />
            </Field>

            <Field
              label="Email" optional htmlFor="f-email" error={w.errors.email}
              hint="Only used if the Office of Academics needs to follow up on your reflection."
            >
              <TextInput
                id="f-email" type="email" autoComplete="email" placeholder="you@jainuniversity.ac.in"
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

            <Field label="Location" htmlFor="f-location" error={w.errors.location}>
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

            {RESEARCH_FIELDS.map(([key, label, placeholder]) => (
              <Field key={key} label={label} htmlFor={`f-${key}`} error={w.errors[key]}>
                <TextArea
                  id={`f-${key}`} placeholder={placeholder}
                  value={w.data[key]} error={w.errors[key]}
                  onChange={(e) => w.set({ [key]: e.target.value })}
                />
              </Field>
            ))}
          </section>
        ) : null}

        {w.step === 2 ? (
          <section className="step-panel">
            <StepHead
              kicker="Where Do You Teach?"
              heading="The programmes, semesters and courses where you meet your learners."
              note="Tell us about the academic spaces where you teach and engage with learners. Add every programme, semester and course combination that reflects your teaching."
            />
            <VisualFrame scene="teaching" caption="The academic spaces where you meet your learners." />

            <div className="field-group" data-field="engagements">
              <div className="field-label">Your Academic Engagements</div>
              <div className="engagement-list">
                {w.data.engagements.map((item, index) => (
                  <div className="engagement-card" key={index}>
                    <div className="engagement-head">
                      <div className="engagement-number">
                        Academic Engagement {String(index + 1).padStart(2, '0')}
                      </div>
                      {w.data.engagements.length > 1 ? (
                        <button
                          type="button" className="engagement-remove"
                          onClick={() =>
                            w.set({ engagements: w.data.engagements.filter((_, i) => i !== index) })
                          }
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <div className="engagement-grid">
                      <div>
                        <label className="field-label" htmlFor={`f-eng-prog-${index}`}>Programme</label>
                        <TextInput
                          id={`f-eng-prog-${index}`} placeholder="e.g. B.Com Finance"
                          value={item.programme}
                          onChange={(e) => {
                            const next = [...w.data.engagements]
                            next[index] = { ...item, programme: e.target.value }
                            w.set({ engagements: next })
                          }}
                        />
                      </div>
                      <div>
                        <label className="field-label" htmlFor={`f-eng-sem-${index}`}>Semester</label>
                        <Select
                          id={`f-eng-sem-${index}`} value={item.semester}
                          onChange={(e) => {
                            const next = [...w.data.engagements]
                            next[index] = { ...item, semester: e.target.value }
                            w.set({ engagements: next })
                          }}
                        >
                          <option value="">Select semester</option>
                          {(meta?.semesters || []).map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                      </div>
                      <div style={{ gridColumn: '1/-1' }}>
                        <label className="field-label" htmlFor={`f-eng-course-${index}`}>Course Name</label>
                        <TextInput
                          id={`f-eng-course-${index}`} placeholder="e.g. Financial Accounting"
                          value={item.course_name}
                          onChange={(e) => {
                            const next = [...w.data.engagements]
                            next[index] = { ...item, course_name: e.target.value }
                            w.set({ engagements: next })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button" className="engagement-add"
                onClick={() =>
                  w.set({
                    engagements: [...w.data.engagements, { programme: '', semester: '', course_name: '' }],
                  })
                }
              >
                ＋ Add One More Academic Engagement
              </button>
              <FieldError>{w.errors.engagements}</FieldError>
            </div>

            <Field label="Date of the meeting" htmlFor="f-meeting_date" error={w.errors.meeting_date}>
              <TextInput
                id="f-meeting_date" type="date" max={today} value={w.data.meeting_date}
                error={w.errors.meeting_date}
                onChange={(e) => w.set({ meeting_date: e.target.value })}
              />
            </Field>
          </section>
        ) : null}

        {w.step === 3 ? (
          <section className="step-panel">
            <StepHead
              kicker="The Future I See for Myself"
              heading="Imagining the person, purpose and possibilities ahead."
              note="Beyond the roles we hold today lies the person we continue to become. Take a moment to imagine the future you wish to create for yourself."
            />
            <VisualFrame scene="horizon" caption="Beyond the roles we hold today lies the person we continue to become." />

            <div className="field-group" data-field="vision_self">
              <div className="field-label">My vision for my future</div>
              <Reflection
                id="f-vision_self" value={w.data.vision_self} error={w.errors.vision_self}
                onChange={(v) => w.set({ vision_self: v })}
                placeholder="Take a moment. Write freely about where you see yourself heading…"
              />
              <FieldError id="f-vision_self-error">{w.errors.vision_self}</FieldError>
            </div>
          </section>
        ) : null}

        {w.step === 4 ? (
          <section className="step-panel">
            <StepHead
              kicker="The India I Hope to See"
              heading="Envisioning the nation our learners will help shape."
              note="The future of a nation is shaped by the aspirations, ideas and actions of its people. What kind of India do you hope to see, and what role can education and your discipline play in shaping it?"
            />
            <VisualFrame scene="nation" caption="The nation our learners will help shape." />

            <div className="field-group" data-field="vision_india">
              <div className="field-label">My vision for India&rsquo;s future</div>
              <Reflection
                id="f-vision_india" value={w.data.vision_india} error={w.errors.vision_india}
                onChange={(v) => w.set({ vision_india: v })}
                placeholder="What kind of India do you hope your students will build?"
              />
              <FieldError id="f-vision_india-error">{w.errors.vision_india}</FieldError>
            </div>
          </section>
        ) : null}

        {w.step === 5 ? (
          <section className="step-panel">
            <StepHead kicker="A Thought to Carry Forward" heading="Your reflections, revisited." />
            <ReviewGrid
              onEdit={w.jump}
              rows={[
                { key: 'Name', value: w.data.name, step: 1 },
                { key: 'Email', value: w.data.email, step: 1 },
                { key: 'Department', value: w.data.department, step: 1 },
                { key: 'Location', value: w.data.location, step: 1 },
                ...RESEARCH_FIELDS.map(([key, label]) => ({
                  key: label, value: w.data[key], step: 1, long: true,
                })),
                {
                  key: 'Academic Engagements',
                  value: w.data.engagements
                    .map((e, i) =>
                      `Academic Engagement ${String(i + 1).padStart(2, '0')}\nProgramme: ${e.programme}\nSemester: ${e.semester}\nCourse: ${e.course_name}`)
                    .join('\n\n'),
                  step: 2, long: true,
                },
                { key: 'Date of the meeting', value: formatDate(w.data.meeting_date), step: 2 },
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
              {w.status === 'saving' ? <><Spinner label="Submitting" /> Submitting…</> : 'Submit →'}
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

function formatDate(value) {
  if (!value) return ''
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Confirmation({ onRestart, onStart }) {
  return (
    <Cover variant="back">
      <LogoLockup subtitle="Office of Academics · Faculty Dialogue" variant="light" />
      <ConfirmMark />
      <h2 className="confirm-title">Thank You for the Dialogue.</h2>
      <p className="confirm-sub">Your reflection has been successfully recorded.</p>
      <p className="confirm-quote">
        &ldquo;Your vision contributes to a larger conversation about the future of our learners, our
        University and India.&rdquo;
      </p>
      <div className="cover-links">
        <button className="btn-outline" type="button" onClick={onRestart}>Start a New Response</button>
        <button className="btn-outline" type="button" onClick={onStart}>Back to faculty dialogue</button>
      </div>
    </Cover>
  )
}
