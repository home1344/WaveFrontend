import React, { useState, useEffect, useCallback } from 'react'
import { menuConfig } from '../utils/constants.ts'

const TopBar = () => {
  const currentUrl = new URL(window.location.href)

  return (
    <>
      <header className="header">
        <div className="mainmenu-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <nav className="navbar navbar-expand-lg navbar-light">
                  <div className="container-fluid p-0">
                    <a className="navbar-brand" href="index.html">
                      <img src="assets/images/logo.png" alt="" height={75} />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                      data-bs-target="#main_menu" aria-controls="main_menu" aria-expanded="false"
                      aria-label="Toggle navigation">
                      <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-end fixed-height" id="main_menu" style={{marginRight: "24px"}}>
                      <ul className="navbar-nav ml-auto">
                        {
                          menuConfig.map((item, index) => {
                            return (
                              <li className="nav-item" key={index}>
                                <a className={currentUrl.pathname == item.link ? "nav-link active" : "nav-link"} href={item.link}> {item.name}</a>
                                <div className="mr-hover-effect"></div>
                              </li>
                            )
                          })
                        }

                      </ul>
                      <w3m-button />
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default TopBar
