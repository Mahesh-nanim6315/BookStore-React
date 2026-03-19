import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../../../components/common/Loader'
import { getAdminAuthor } from '../../../api/adminAuthors'

const AdminAuthorsShow = () => {
  const { id } = useParams()
  const [author, setAuthor] = useState(null)

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const response = await getAdminAuthor(id)
        if (response.success) {
          setAuthor(response.data.author)
        }
      } catch (error) {
        console.error('Failed to load author:', error)
      }
    }

    loadAuthor()
  }, [id])

  if (!author) {
    return <Loader />
  }

  return (
    <div className="page">
      <div className="page-header admin-list-header">
        <div>
          <h2>{author.name}</h2>
          <p className="admin-page-subtitle">Review author profile details and catalog contribution.</p>
        </div>

        <Link to="/dashboard/authors" className="admin-button">
          Back to authors
        </Link>
      </div>

      <div className="book-show-layout">
        <div className="book-show-cover">
          {author.image ? (
            <img src={author.image} alt={author.name} />
          ) : (
            <div className="book-cover-placeholder">No author image</div>
          )}
        </div>

        <div className="book-show-card">
          <p><strong>Name:</strong> {author.name}</p>
          <p><strong>Total Books:</strong> {author.books_count || 0}</p>
          <p><strong>Bio:</strong> {author.bio || 'No bio available.'}</p>

          <div className="book-action-row">
            <Link
              to={`/dashboard/authors/${author.id}/edit`}
              className="admin-icon-action admin-icon-action--edit"
              aria-label={`Edit ${author.name}`}
              title="Edit"
            >
              <img src="/images/edit.png" alt="" className="admin-icon-action__icon" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAuthorsShow
