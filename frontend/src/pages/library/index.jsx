import React from 'react'

const LibraryIndex = () => {
  return (
    <div className="page">
<title>My Library</title>
{/*      */}
{/* 


 */}

<div className="library-container" style={{ marginTop: '100px' }}>

    <h1 className="library-title">ðŸ“š My Library</h1>
{/* 
    ) */}
        <p className="empty-text">You have no books in your library yet.</p>
{/*      */}
        <div className="library-grid">
{/*              */}
{/* 
                ) */}
                <div className="library-card">

                    <img src="" alt="" />

                    <h3></h3>

                    <span className="format-badge ">
                        
                    </span>

                    {}
{/*                      */}
                        <a href="" target="_blank"
                           className="btn read">ðŸ“– Read</a>
{/* 
                     */}
                        <a href=""
                           className="btn listen">ðŸŽ§ Listen</a>
{/* 
                     */}
                        <span className="owned">âœ” Paperback Owned</span>
{/*                      */}

                    {}
{/*                      */}
                        <small className="expiry">
                            Expires on 
                        </small>
{/*                      */}

                </div>
{/*                  */}
{/* 
             */}
        </div>
{/*      */}

</div>
{/* 
 */}
    </div>
  )
}

export default LibraryIndex







