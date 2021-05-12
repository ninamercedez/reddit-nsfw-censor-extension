import React, { useEffect, useState } from 'react'
import { Form, Field } from 'react-final-form'
import useInterval from 'use-interval'
import omitBy from 'lodash/omitBy'
import isEmpty from 'lodash/isEmpty'
import {
  CENSOR_LEVELS,
  CENSOR_AREAS,
  CENSOR_TYPES,
  CENSOR_LEVEL_KEYS
} from './constants'
import './style.css';

const getSettings = () => new Promise(resolve => {
  window.chrome.storage.local.get(['n__settings'], (settings) => {
    resolve(settings['n__settings'])
  })
})

const getSetting = async k => {
  const settings = await getSettings()
  return settings[k]
}

const DEFAULT_SETTINGS = {
  'censor-level': CENSOR_LEVEL_KEYS.MEDIUM,
  'detection-server-url': 'http://localhost:8040',
  'classification-server-url': 'http://localhost:8041',
}

const FieldInput = ({ name, ...rest }) => {
  return (
    <Field name={name}>
      {({ input }) => (
        <input type="text" {...rest} {...input} />
      )}
    </Field>
  )
}

const FieldSelect = ({ options, name, ...rest }) => {
  return (
    <Field name={name}>
      {({ input }) => (
        <select {...rest} {...input}>
          {options.map((option) => (
            <option {...option} />
          ))}
        </select>
      )}
    </Field>
  )
}

const Popup = () => {
  const prepData = data => omitBy(data, isEmpty)

  const restoreDefaults = () => _setSettings(DEFAULT_SETTINGS)

  const [settings, _setSettings] = useState({})

  const classificationServerUrl = settings?.['classification-server-url']
  const detectionServerUrl = settings?.['detection-server-url']

  const [isClassificationServerThinking, setIsClassificationServerThinking] = useState(false)
  const [isDetectionServerThinking, setIsDetectionServerThinking] = useState(false)

  const [classificationServerOnline, setClassificationServerOnline] = useState()
  const [detectionServerOnline, setDetectionServerOnline] = useState()

  const setSettings = s => _setSettings(prev => prepData({
    ...prev,
    ...s,
  }))

  const checkServerOnline = async (serverUrl) => {
    let result
    const controller = new AbortController();
    const { signal } = controller;
    setTimeout(() => controller.abort(), 1000)
    try {
      result = (await fetch(`${serverUrl}/sync`, { signal })).status === 405
    } catch {
      result = false
    }
    return result
  }

  const checkClassificationServerOnline = async () => {
    const classificationServerResult = await checkServerOnline(classificationServerUrl)
    setIsClassificationServerThinking(false)
    setClassificationServerOnline(classificationServerResult)
  }

  const checkDetectionServerOnline = async () => {
    const detectionServerResult = await checkServerOnline(detectionServerUrl)
    setIsDetectionServerThinking(false)
    setDetectionServerOnline(detectionServerResult)
  }

  const checkClassificationServerInterval = useInterval(checkClassificationServerOnline, 1000)
  const checkDetectionServerInterval = useInterval(checkDetectionServerOnline, 1000)

  const detectionServerStatus = (
    isDetectionServerThinking
      ? 'working'
      : (detectionServerOnline ? 'online' : 'offline')
  )

  const classificationServerStatus = (
    isClassificationServerThinking
      ? 'working'
      : (classificationServerOnline ? 'online' : 'offline')
  )

  useEffect(() => {
    setIsClassificationServerThinking(true)
  }, [classificationServerUrl])

  useEffect(() => {
    setIsDetectionServerThinking(true)
  }, [detectionServerUrl])

  useEffect(() => {
    (async () => {
      const chromeSettings = await getSettings()
      setSettings({ ...DEFAULT_SETTINGS, ...(chromeSettings || {}) })
    })()
  }, [])

  useEffect(() => {
    console.log('settings are', settings)
    window.chrome.storage.local.set({ 'n__settings': prepData(settings) })
  }, [settings])

  return (
    <div className="popup">
      <h3>Settings</h3>
      <Form onSubmit={setSettings} initialValues={settings}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <section>
              <label className="bold">Level</label>
              <FieldSelect name="censor-level" options={Object.keys(CENSOR_LEVELS).map(k => ({ label: CENSOR_LEVELS[k].label, value: k }))} />
            </section>
            {/* <span className="row">
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Enabled</th>
                    <th>Type</th>
                    <th>Strength</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(CENSOR_AREAS).map(k => (
                    <tr>
                      <td>{CENSOR_AREAS[k].label}</td>
                      <td>enabled</td>
                      <td>
                        <FieldSelect
                          name={`censor-type-${k}`}
                          options={Object.keys(CENSOR_TYPES).map(
                            ct => ({ value: ct, label: CENSOR_TYPES[ct].label })
                          )}
                        />
                      </td>
                      <td>strength</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </span> */}
            <section>
              <label for="classification-server-url">Classification server url</label>
              <span className="row">
                <FieldInput name="classification-server-url" type="text" />
                <span className={`status-light status-light--status-${classificationServerStatus}`} />
              </span>
            </section>
            <section>
              <label for="detection-server-url">Detection server url</label>
              <span className="row">
                <FieldInput name="detection-server-url" type="text" />
                <span className={`status-light status-light--status-${detectionServerStatus}`} />
              </span>
            </section>
            <section>
              <input type="submit" value="Save" />
            </section>
          </form>
        )}
      </Form>
      <section>
        <button onClick={restoreDefaults}>Restore defaults</button>
      </section>
    </div >
  )
}

export default Popup;
