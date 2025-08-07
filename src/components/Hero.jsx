import React, { useState, useEffect, useCallback } from 'react'

const Hero = () => {

  return (
    <>
      <div className="hero-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 d-flex align-self-center">
              <div className="left-content">
                <div className="content">
                  <h5 className="subtitle">
                    Wave Wealth Prize Pool
                  </h5>
                  <h1 className="title">
                    PLay To WIN
                  </h1>
                  <p className="text">
                  Community-driven. Transparent. Rewarding. Play, Invest,Exchange and Join the Contest with high rewards at Wave Wealth!
                  </p>
                  <div className="links">
                    <a href="/prize" className="mybtn1 link1">Join the Prize Pool</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="hero-img2 d-block d-md-none">
                <img src="assets/images/hero.png" alt="" />
              </div>
              <div className="hero-img d-none d-md-block">
                <img className="shape man" src="assets/images/hero.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Hero
