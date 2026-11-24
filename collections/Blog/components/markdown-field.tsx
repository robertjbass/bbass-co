'use client'

import { useRef, useState } from 'react'
import { Button, useField, FieldLabel, useListDrawer } from '@payloadcms/ui'
import type { Media } from '@/payload-types'
import type { TextareaFieldClientComponent } from 'payload'
import { MarkdownPreview } from '@/components/blog/markdown-preview'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => <div style={{ height: 500 }} />,
})

const MarkdownField: TextareaFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })

  const editor = useRef<HTMLDivElement>(null)
  const position = useRef(0)
  const [imageError, setImageError] = useState('')
  const [MediaDrawer, , { openDrawer, closeDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    selectedCollection: 'media',
  })

  function chooseImage() {
    const input = editor.current?.querySelector('textarea')
    position.current = input?.selectionEnd ?? value?.length ?? 0
    setImageError('')
    openDrawer()
  }

  async function insertImage(selected: Partial<Media>) {
    try {
      let media = selected
      if (!media.filename || !media.alt) {
        const response = await fetch('/api/media/' + selected.id + '?depth=0')
        if (!response.ok)
          throw new Error(
            'Could not read the selected image. Try selecting it again.',
          )
        media = await response.json()
      }
      if (!media.filename || !media.alt)
        throw new Error(
          'Add a file and alt text to this Media item before inserting it.',
        )
      const alt = media.alt
        .replace(/\s+/g, ' ')
        .replace(/[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]/g, '\\$&')
      const url = '/api/media/file/' + encodeURIComponent(media.filename)
      const token = '![' + alt + '](<' + url + '>)'
      const body = value ?? ''
      const index = position.current
      setValue(body.slice(0, index) + token + body.slice(index))
      closeDrawer()
      requestAnimationFrame(() => {
        const input = editor.current?.querySelector('textarea')
        input?.focus()
        input?.setSelectionRange(index + token.length, index + token.length)
      })
    } catch (error) {
      closeDrawer()
      setImageError(
        error instanceof Error
          ? error.message
          : 'Could not insert the selected image.',
      )
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <style>{`.w-md-editor-text-input, .w-md-editor-text-pre { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important; font-size: 13px !important; }`}</style>
      <FieldLabel label={field.label} path={path} required={field.required} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBlock: '0.5rem',
        }}
      >
        <Button
          type="button"
          buttonStyle="secondary"
          size="small"
          margin={false}
          onClick={chooseImage}
        >
          Insert image from Media
        </Button>
        <details>
          <summary style={{ cursor: 'pointer' }}>Link formatting</summary>
          <p>
            External links default to nofollow. Use{' '}
            <code>{'[label](https://example.com "follow")'}</code> for an
            editorial follow link, "sponsored" for paid placements, or "ugc" for
            user-submitted links.
          </p>
        </details>
      </div>
      <MediaDrawer allowCreate onSelect={({ doc }) => void insertImage(doc)} />
      {imageError && <p role="alert">{imageError}</p>}
      <div ref={editor} style={{ marginTop: 8 }}>
        <MDEditor
          value={value || ''}
          onChange={(val) => setValue(val ?? '')}
          height={500}
          components={{
            preview: (source) => <MarkdownPreview source={source} />,
          }}
          preview="edit"
        />
      </div>
    </div>
  )
}

export default MarkdownField
