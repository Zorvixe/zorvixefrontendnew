"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { CheckCircle, Upload, FileText, User, Mail, Phone, Briefcase, AlertCircle } from "lucide-react"
import "./Onboarding.css"

const API_BASE_URL = "https://zorvixelocalbackend.onrender.com"

export default function Onboarding() {
  const { token } = useParams()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (token) {
      fetchCandidateDetails()
    }
  }, [token])

  const fetchCandidateDetails = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate-details/${token}`)
      const data = await response.json()

      if (data.success) {
        setCandidate(data.candidate)
      } else {
        // Show more specific error messages
        if (data.message.includes("expired")) {
          setError("This onboarding link has expired. Please contact HR for a new link.")
        } else if (data.message.includes("inactive")) {
          setError("This onboarding link has been deactivated. Please contact HR for assistance.")
        } else {
          setError(data.message || "Failed to load candidate details")
        }
      }
    } catch (err) {
      setError("Error loading candidate details: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file only")
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        setError("File size must be less than 50MB")
        return
      }

      setSelectedFile(file)
      setError("")
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload")
      return
    }

    setUploading(true)
    setError("")
    setSuccess("")
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("certificate", selectedFile)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status === 201) {
          const data = JSON.parse(xhr.responseText)
          setSuccess("Certificate uploaded successfully!")
          setSelectedFile(null)
          fetchCandidateDetails() // Refresh candidate details
        } else {
          const errorData = JSON.parse(xhr.responseText)
          setError(errorData.message || "Upload failed")
        }
        setUploading(false)
        setUploadProgress(0)
      })

      xhr.addEventListener("error", () => {
        setError("Upload failed. Please try again.")
        setUploading(false)
        setUploadProgress(0)
      })

      xhr.open("POST", `${API_BASE_URL}/api/candidate/upload/${token}`)
      xhr.send(formData)
    } catch (err) {
      setError("Error uploading file: " + err.message)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="onboarding-container-onb">
        <div className="loading-card-onb">
          <div className="loading-content-onb">
            <div className="loading-spinner-onb"></div>
            <p>Loading candidate details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !candidate) {
    return (
      <div className="onboarding-container-onb">
        <div className="error-card-onb">
          <div className="alert-error-onb">
            <AlertCircle className="alert-icon-onb" />
            <div className="alert-description-onb">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="onboarding-page-onb">
       <div className="header">
        <img src="/miniassets/img/zorvixe_logo_main.png" alt="Zorvixe Logo" className="logo_payment" />
      </div>

      <div className="onboarding-content-onb">
        {/* Header */}
        <div className="page-header-onb">
          <h1 className="page-title-onb">Welcome to Zorvixe Technologies</h1>
          <p className="page-subtitle-onb">Candidate Onboarding Portal</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert-error-onb">
            <AlertCircle className="alert-icon-onb" />
            <div className="alert-description-onb">{error}</div>
          </div>
        )}

        {success && (
          <div className="alert-success-onb">
            <CheckCircle className="alert-icon-onb" />
            <div className="alert-description-onb">{success}</div>
          </div>
        )}

        {candidate && !candidate.hasUploaded && (
          <div className="alert-warning-onb">
            <AlertCircle className="alert-icon-onb" />
            <div className="alert-description-onb">
              <strong>Important:</strong> This onboarding link will expire in 2 hours from when it was generated. Please
              upload your documents as soon as possible.
            </div>
          </div>
        )}

        <div className="cards-grid-onb">
          {/* Candidate Information Card */}
          <div className="card-onb">
            <div className="card-header-onb">
              <div className="card-title-onb">
                <User className="card-icon-onb" />
                Candidate Information
              </div>
              <div className="card-description-onb">Please verify your details below</div>
            </div>
            <div className="card-content-onb">
              <div className="info-item-onb">
                <User className="info-icon-onb" />
                <div className="info-details-onb">
                  <p className="info-value-onb">{candidate?.name}</p>
                  <p className="info-label-onb">Full Name</p>
                </div>
              </div>

              <div className="info-item-onb">
                <Mail className="info-icon-onb" />
                <div className="info-details-onb">
                  <p className="info-value-onb">{candidate?.email}</p>
                  <p className="info-label-onb">Email Address</p>
                </div>
              </div>

              <div className="info-item-onb">
                <Phone className="info-icon-onb" />
                <div className="info-details-onb">
                  <p className="info-value-onb">{candidate?.phone}</p>
                  <p className="info-label-onb">Phone Number</p>
                </div>
              </div>

              <div className="info-item-onb">
                <Briefcase className="info-icon-onb" />
                <div className="info-details-onb">
                  <p className="info-value-onb">{candidate?.position}</p>
                  <p className="info-label-onb">Position</p>
                </div>
              </div>

              <div className="candidate-id-section-onb">
                <div className="candidate-id-row-onb">
                  <span className="candidate-id-label-onb">Candidate ID:</span>
                  <span className="candidate-id-badge-onb">{candidate?.candidate_id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload Card */}
          <div className="card-onb">
            <div className="card-header-onb">
              <div className="card-title-onb">
                <FileText className="card-icon-onb" />
                Document Upload
              </div>
              <div className="card-description-onb">Upload your certificates and documents as a single PDF file</div>
            </div>
            <div className="card-content-onb">
              {candidate?.hasUploaded ? (
                <div className="upload-success-onb">
                  <CheckCircle className="success-icon-onb" />
                  <h3 className="success-title-onb">Documents Already Uploaded!</h3>
                  <p className="success-description-onb">
                    Your documents have been successfully uploaded and are under review.
                  </p>

                  {candidate.uploadDetails && (
                    <div className="upload-details-onb">
                      <p className="upload-detail-onb">
                        <strong>File:</strong> {candidate.uploadDetails.file_name}
                      </p>
                      <p className="upload-detail-onb">
                        <strong>Uploaded:</strong> {new Date(candidate.uploadDetails.upload_date).toLocaleDateString()}
                      </p>
                      <p className="upload-detail-onb">
                        <strong>Size:</strong> {formatFileSize(candidate.uploadDetails.file_size)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="upload-section-onb">
                  <div className="upload-area-onb">
                    <Upload className="upload-icon-onb" />
                    <div className="upload-text-onb">
                      <p className="upload-title-onb">Upload Your Certificates</p>
                      <p className="upload-subtitle-onb">Please combine all your certificates into a single PDF file</p>
                      <p className="upload-note-onb">Maximum file size: 50MB | Format: PDF only</p>
                    </div>

                    <div className="upload-button-container-onb">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="file-input-onb"
                        id="certificate-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="certificate-upload" className="file-label-onb">
                        <Upload className="file-label-icon-onb" />
                        Choose PDF File
                      </label>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="selected-file-onb">
                      <div className="selected-file-info-onb">
                        <div className="selected-file-details-onb">
                          <p className="selected-file-name-onb">{selectedFile.name}</p>
                          <p className="selected-file-size-onb">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <FileText className="selected-file-icon-onb" />
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="upload-progress-onb">
                      <div className="progress-header-onb">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="progress-bar-onb">
                        <div className="progress-fill-onb" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  <button onClick={handleUpload} disabled={!selectedFile || uploading} className="upload-btn-onb">
                    {uploading ? (
                      <>
                        <div className="btn-spinner-onb"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="btn-icon-onb" />
                        Upload Certificate
                      </>
                    )}
                  </button>

                  <div className="upload-disclaimer-onb">
                    <p>By uploading, you confirm that all documents are authentic and complete.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="card-onb instructions-card-onb">
          <div className="card-header-onb">
            <div className="card-title-onb">Upload Instructions</div>
          </div>
          <div className="card-content-onb">
            <div className="instructions-grid-onb">
              <div className="instructions-section-onb">
                <h4 className="instructions-title-onb">Required Documents:</h4>
                <ul className="instructions-list-onb">
                  <li>• Educational certificates 10th to Degree</li>
                  <li>• Professional certifications</li>
                  <li>• Experience certificates</li>
                  <li>• Identity proof</li>
                  <li>• Address proof</li>
                  <li>• Signed Offer Letter</li>
                  <li>• Government-issued ID proof (Aadhar/Passport/PAN) </li>
                  <li>• Recent passport-sized photograph</li>
                  <li>• Any other relevant documents</li>
                  <li>• Bank account details for stipend processing</li>
                </ul>
              </div>
              <div className="instructions-section-onb">
                <h4 className="instructions-title-onb">Guidelines:</h4>
                <ul className="instructions-list-onb">
                  <li>• Combine all documents into one PDF</li>
                  <li>• Ensure documents are clear and readable</li>
                  <li>• Maximum file size: 50MB</li>
                  <li>• Only PDF format is accepted</li>
                  <li>• Upload once - modifications require admin assistance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="container copyright text-center mt-4">
          <p>
            <span>Copyright &copy; {currentYear}</span>
            <strong className="px-1 sitename">ZORVIXE</strong>
            <span>All Rights Reserved</span>
          </p>
        </div>
      </div>
    </div>
  )
}
